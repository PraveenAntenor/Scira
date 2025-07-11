import 'katex/dist/katex.min.css';

import { Geist_Mono } from 'next/font/google';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import Latex from 'react-latex-next';
import Marked, { ReactRenderer } from 'marked-react';
import React, { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Check, Copy, WrapText, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

interface MarkdownRendererProps {
  content: string;
}

interface CitationLink {
  text: string;
  link: string;
}

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  preload: true,
  display: 'swap',
});

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const { resolvedTheme } = useTheme();

  const renderer: Partial<ReactRenderer> = {
    list(children, ordered) {
      const ListTag = ordered ? 'ol' : 'ul';
      return (
        <ListTag
          className={`my-5 pl-6 space-y-2 text-neutral-700 dark:text-neutral-300 ${
            ordered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {React.Children.map(children, (child, index) => (
            <li key={`list-item-${index}`} className="pl-1 leading-relaxed">
              {child}
            </li>
          ))}
        </ListTag>
      );
    },
    table(children) {
      return <Table className="!border !rounded-lg !m-0">{children}</Table>;
    },
    tableHeader(children) {
      return <TableHeader className="!p-1 !m-1">{children}</TableHeader>;
    },
    tableBody(children) {
      return <TableBody className="!text-wrap !m-1">{children}</TableBody>;
    },
    tableRow(children) {
      return <TableRow key={`row-${Math.random().toString(36).substring(2, 8)}`}>{children}</TableRow>;
    },
    tableCell(children, flags) {
      const alignClass = flags.align ? `text-${flags.align}` : 'text-left';
      const isHeader = flags.header;

      return isHeader ? (
        <TableHead
          key={`th-${Math.random().toString(36).substring(2, 8)}`}
          className={cn(
            alignClass,
            'border-r border-border last:border-r-0 bg-muted/50 font-semibold !p-2 !m-1 !text-wrap'
          )}
        >
          {children}
        </TableHead>
      ) : (
        <TableCell
          key={`td-${Math.random().toString(36).substring(2, 8)}`}
          className={cn(
            alignClass,
            'border-r border-border last:border-r-0 !p-2 !m-1 !text-wrap'
          )}
        >
          {children}
        </TableCell>
      );
    },
  };

  return (
    <div className="mt-3 markdown-body prose prose-neutral dark:prose-invert max-w-none dark:text-neutral-200 font-sans">
      <Marked renderer={renderer}>{content}</Marked>
    </div>
  );
};

export const CopyButton = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        if (!navigator.clipboard) return;
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast.success('Copied to clipboard');
      }}
      className="h-8 px-2 text-xs rounded-full"
    >
      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
};

export { MarkdownRenderer };
export function preprocessLaTeX(text: string): string {
  // Example: convert \( \) into $ $ for LaTeX
  return text.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
}

