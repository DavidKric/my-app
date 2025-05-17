import React, { useState } from 'react';
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider';
import { Dialog, DialogHeader, DialogFooter, DialogTitle, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Annotation } from '@/components/pdf_viewer/annotations/AnnotationOverlay';

interface Props {
  annotation: Annotation;
  onClose: () => void;
}

export default function AnnotationEditDialog({ annotation, onClose }: Props) {
  const { updateAnnotation } = useAnnotations();
  const [category, setCategory] = useState(annotation.category);
  const [comment, setComment] = useState(annotation.comment || '');

  const handleSave = () => {
    updateAnnotation(annotation.id, { category, comment });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Annotation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Category</label>
            <Input value={category} onChange={e => setCategory(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold">Comment</label>
            <Textarea value={comment} onChange={e => setComment(e.target.value)} />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
