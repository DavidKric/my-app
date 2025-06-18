import { NextRequest, NextResponse } from 'next/server';
import weaviate, { WeaviateClient } from 'weaviate-client';
import { Document } from 'langchain/document';
import { ChatOpenAI } from '@langchain/openai';
import { loadQAStuffChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';

const WEAVIATE_URL = process.env.WEAVIATE_URL || "http://127.0.0.1:8080";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Required for ChatOpenAI

const CLASS_NAME = "LegalDocumentChunk";

async function getWeaviateClient(): Promise<WeaviateClient> {
    const url = new URL(WEAVIATE_URL);
    const scheme = url.protocol.slice(0, -1);
    const host = url.host;

    const client: WeaviateClient = weaviate.client({
        scheme: scheme,
        host: host,
    });
    return client;
}

export async function POST(req: NextRequest) {
    let caseIdFromBody: string | undefined; // To use in error messages if body parsing fails early

    try {
        const body = await req.json();
        const { query, caseId, documentId: requestedDocumentId } = body;
        caseIdFromBody = caseId; // Store for potential error reporting

        if (!query || !caseId) {
            return NextResponse.json({ error: "Missing required fields: query and caseId" }, { status: 400 });
        }

        if (!OPENAI_API_KEY) {
            console.error("OpenAI API key is not set. Please set the OPENAI_API_KEY environment variable.");
            return NextResponse.json({ error: "OpenAI API key not configured." }, { status: 500 });
        }

        const client = await getWeaviateClient();

        let queryBuilder = client.graphql
            .get()
            .withClassName(CLASS_NAME)
            .withTenant(caseId)
            .withHybrid({
                query: query,
                alpha: 0.7,
            })
            .withLimit(5) // Fetch initial set of chunks
            .withFields("content documentId pageNumber _additional { id distance }");

        if (requestedDocumentId) {
            queryBuilder = queryBuilder.withWhere({
                path: ["documentId"],
                operator: "Equal",
                valueText: requestedDocumentId,
            });
        }

        const weaviateResult = await queryBuilder.do();

        if (!weaviateResult.data?.Get?.[CLASS_NAME] || weaviateResult.data.Get[CLASS_NAME].length === 0) {
            return NextResponse.json({ answer: "No relevant excerpts found to answer the question.", sources: [] }, { status: 200 });
        }

        let weaviateChunks = weaviateResult.data.Get[CLASS_NAME].map((item: any) => ({
            chunkId: item._additional.id,
            documentId: item.documentId,
            pageNumber: item.pageNumber,
            content: item.content,
            distance: item._additional.distance,
        }));

        // Single-Document Context Logic
        let finalDocumentIdToProcess: string;
        if (requestedDocumentId) {
            finalDocumentIdToProcess = requestedDocumentId;
        } else {
            // If no documentId was specified, pick the one from the top-ranked chunk
            finalDocumentIdToProcess = weaviateChunks[0].documentId;
            weaviateChunks = weaviateChunks.filter(chunk => chunk.documentId === finalDocumentIdToProcess);
        }

        // Ensure we still have chunks after filtering
        if (weaviateChunks.length === 0) {
             return NextResponse.json({ answer: `No relevant excerpts found for document ${finalDocumentIdToProcess} to answer the question.`, sources: [] }, { status: 200 });
        }

        // Prepare Documents for LangChain
        const langChainDocs = weaviateChunks.map(chunk => new Document({
            pageContent: chunk.content,
            metadata: {
                documentId: chunk.documentId,
                pageNumber: chunk.pageNumber,
                chunkId: chunk.chunkId, // Ensure chunkId is passed to LangChain metadata
                // distance: chunk.distance // Optionally include distance if useful for chain/prompt
            },
        }));

        // Define Prompt Template
        const promptTemplate = new PromptTemplate({
            template: `Use the following legal document excerpts to answer the question.
Provide a concise answer. If the answer is not found in the excerpts, say so.
Base your answer ONLY on the provided excerpts.

Excerpts:
{context}

Question: {question}
Answer:`,
            inputVariables: ["context", "question"],
        });

        // Initialize LLM
        const llm = new ChatOpenAI({
            openAIApiKey: OPENAI_API_KEY,
            modelName: "gpt-4", // Or your preferred model
            temperature: 0,
        });

        // Create and Run QA Chain
        const chain = loadQAStuffChain(llm, { prompt: promptTemplate });
        const qaResult = await chain.invoke({
            input_documents: langChainDocs,
            question: query,
        });

        // Update Response
        // The sources should be the LangChain documents (or their relevant parts) that were used.
        const responseSources = langChainDocs.map(doc => ({
            chunkId: doc.metadata.chunkId,
            documentId: doc.metadata.documentId,
            pageNumber: doc.metadata.pageNumber,
            content: doc.pageContent, // or a snippet if preferred
        }));

        return NextResponse.json({ answer: qaResult.text, sources: responseSources }, { status: 200 });

    } catch (error: any) {
        console.error("Error in semantic search API with LangChain:", error);

        if (error.message && error.message.includes("Connection refused")) {
            return NextResponse.json({ error: "Could not connect to Weaviate. Ensure it is running." }, { status: 503 });
        }
        // Handle OpenAI API key errors specifically if possible (often a 401 or specific message)
        if (error.response && error.response.status === 401) { // Axios-like error structure
             return NextResponse.json({ error: "OpenAI API key is invalid or missing." }, { status: 401 });
        }
        if (error.message && error.message.toLowerCase().includes("openai") && error.message.toLowerCase().includes("api key")) {
            return NextResponse.json({ error: "OpenAI API key error. Please check configuration." }, { status: 500 });
        }
        // Weaviate not found errors
        const currentCaseId = caseIdFromBody || "unknown"; // Use stored caseId or default
        if (error.message && (error.message.includes("index_not_found_exception") || error.message.includes("404") || error.message.includes("could not find"))) {
             return NextResponse.json({ error: `Tenant or Collection '${CLASS_NAME}' not found for caseId '${currentCaseId}'. Please ensure data is indexed for this case.` }, { status: 404 });
        }

        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
