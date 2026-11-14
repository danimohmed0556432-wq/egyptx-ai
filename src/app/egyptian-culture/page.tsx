import React from 'react';
import type { Metadata } from 'next';
import EgyptianCultureShowcase from '@/components/EgyptianCultureShowcase';

export const metadata: Metadata = {
  title: 'Egyptian Culture | EgyptX AI',
  description:
    "Discover Egypt's legendary icons across arts, music, cinema, literature, sports, and world history.",
};

export default function EgyptianCulturePage() {
  return <EgyptianCultureShowcase />;
}
