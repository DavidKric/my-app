import React from 'react';
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider';
import { Button } from '@/components/ui/button';
import { DropdownMenu, 
         DropdownMenuTrigger, 
         DropdownMenuContent, 
         DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import AnnotationEditDialog from '@/components/context_panel/annotations/AnnotationEditDialog';
import { Annotation } from '@/components/pdf_viewer/annotations/AnnotationOverlay';

interface Props {
  annotation: Annotation;
}

export default function AnnotationActionsMenu({ annotation }: Props) {
  const { deleteAnnotation } = useAnnotations();
  const [openEdit, setOpenEdit] = React.useState(false);

  const handleDelete = () => {
    deleteAnnotation(annotation.id);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setOpenEdit(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {openEdit && (
        <AnnotationEditDialog 
          annotation={annotation}
          onClose={() => setOpenEdit(false)}
        />
      )}
    </>
  );
}

