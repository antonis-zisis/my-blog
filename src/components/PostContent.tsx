'use client';

import DOMPurify from 'isomorphic-dompurify';

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  const clean = DOMPurify.sanitize(content);

  return <div className="prose" dangerouslySetInnerHTML={{ __html: clean }} />;
}
