'use client';

import { useState } from 'react';
import { PostContent } from '~/components/post/PostContent';
import { cn } from '~/lib/utils';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';

interface MarkdownEditorProps {
  name: string;
  defaultValue: string;
}

export function MarkdownEditor({ name, defaultValue }: MarkdownEditorProps) {
  const [content, setContent] = useState(defaultValue);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="space-y-2">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')} className="md:hidden">
        <TabsList>
          <TabsTrigger value="edit">편집</TabsTrigger>
          <TabsTrigger value="preview">미리보기</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={cn('flex flex-col gap-1.5', activeTab !== 'edit' && 'hidden md:flex')}>
          <Label htmlFor={name}>본문 (마크다운)</Label>
          <Textarea
            id={name}
            name={name}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-96 font-mono text-sm"
          />
        </div>
        <div className={cn('flex flex-col gap-1.5', activeTab !== 'preview' && 'hidden md:flex')}>
          <span className="text-sm font-medium text-muted-foreground">미리보기</span>
          <div className="min-h-96 overflow-y-auto rounded-lg border border-input p-4">
            <PostContent content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
