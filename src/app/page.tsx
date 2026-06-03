'use client';

import dynamic from 'next/dynamic';

const TranslatorApp = dynamic(
  () => import('@/components/translator/TranslatorApp'),
  { ssr: false }
);

export default function Home() {
  return <TranslatorApp />;
}
