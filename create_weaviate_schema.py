import weaviate
import weaviate
import weaviate.classes as wvc
import os
from urllib.parse import urlparse

# Configuration
WEAVIATE_URL = os.getenv("WEAVIATE_URL", "http://127.0.0.1:8080") # Changed localhost to 127.0.0.1
CLASS_NAME = "LegalDocumentChunk"

# Define the class schema (v4 style)
# Properties are defined differently in v4, as part of collections.create()
# multiTenancyConfig is also set during creation

def main():
    print(f"Attempting to connect to Weaviate at {WEAVIATE_URL}")

    parsed_url = urlparse(WEAVIATE_URL)
    http_host = parsed_url.hostname
    http_port = parsed_url.port
    scheme = parsed_url.scheme

    if not http_host or not http_port:
        print(f"Could not parse WEAVIATE_URL: {WEAVIATE_URL}. Please ensure it's a full URL like http://127.0.0.1:8080")
        return

    # Use 127.0.0.1 if hostname is localhost
    if http_host == "localhost":
        print("Resolved 'localhost' to '127.0.0.1' for connection.")
        http_host = "127.0.0.1"

    grpc_host = http_host # Assume gRPC host is the same
    grpc_port = 50051     # Default Weaviate gRPC port

    try:
        # v4 client connection
        if WEAVIATE_URL == f"http://127.0.0.1:{http_port}" or WEAVIATE_URL == f"http://localhost:{http_port}":
            print(f"Connecting to local Weaviate instance at {http_host}:{http_port} (gRPC: {grpc_host}:{grpc_port}).")
            client = weaviate.connect_to_local(
                host=http_host,
                port=http_port,
                grpc_port=grpc_port
            )
        else:
            print(f"Connecting to custom Weaviate instance at {WEAVIATE_URL} with gRPC.")
            client = weaviate.connect_to_custom(
                http_host=http_host,
                http_port=http_port,
                http_secure=(scheme == "https"),
                grpc_host=grpc_host,
                grpc_port=grpc_port,
                grpc_secure=False # Assuming gRPC is not secured for custom local/dev setups
            )
        print("Successfully connected to Weaviate.")
    except Exception as e:
        print(f"Error connecting to Weaviate: {e}")
        return

    # Check if class already exists
    try:
        if client.collections.exists(CLASS_NAME):
            print(f"Class '{CLASS_NAME}' already exists.")
            collection = client.collections.get(CLASS_NAME)
            print("Schema details (config):")
            print(collection.config.get())
            client.close()
            return
        else:
            print(f"Class '{CLASS_NAME}' does not exist. Proceeding with creation.")
    except Exception as e:
        print(f"An error occurred while checking for class existence: {e}")
        client.close()
        return

    # Create the class using v4 client
    try:
        client.collections.create(
            name=CLASS_NAME,
            vectorizer_config=wvc.config.Configure.Vectorizer.text2vec_multilingual(),
            multi_tenancy_config=wvc.config.Configure.multi_tenancy(enabled=True),
            properties=[
                wvc.config.Property(name="content", data_type=wvc.config.DataType.TEXT),
                wvc.config.Property(name="documentId", data_type=wvc.config.DataType.TEXT),
                wvc.config.Property(name="pageNumber", data_type=wvc.config.DataType.INT),
            ]
        )
        print(f"Class '{CLASS_NAME}' created successfully.")
    except Exception as e:
        print(f"Error creating class '{CLASS_NAME}': {e}")
        client.close()
        return

    # Verify class creation
    try:
        retrieved_collection = client.collections.get(CLASS_NAME)
        print(f"Verification: Successfully retrieved schema for '{CLASS_NAME}'.")
        print("Schema details (config):")
        print(retrieved_collection.config.get())
    except Exception as e:
        print(f"Error retrieving schema for verification: {e}")
    finally:
        client.close()
        print("Connection closed.")

if __name__ == "__main__":
    main()
