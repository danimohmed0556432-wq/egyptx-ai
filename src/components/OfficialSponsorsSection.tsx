'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface Partner {
  id: string;
  name: string;
  category: string;
  nameKey: string;
  categoryKey: string;
}

const PARTNERS: Partner[] = [
  {
    id: 'tourismMinistry',
    name: 'MINISTRY OF TOURISM & ANTIQUITIES',
    category: 'GOVERNMENT PATRON',
    nameKey: 'home.sponsors.partners.tourismMinistry.name',
    categoryKey: 'home.sponsors.partners.tourismMinistry.category',
  },
  {
    id: 'antiquitiesCouncil',
    name: 'SUPREME COUNCIL OF ANTIQUITIES',
    category: 'ARCHAEOLOGY',
    nameKey: 'home.sponsors.partners.antiquitiesCouncil.name',
    categoryKey: 'home.sponsors.partners.antiquitiesCouncil.category',
  },
  {
    id: 'unesco',
    name: 'UNESCO WORLD HERITAGE',
    category: 'GLOBAL COOPERATION',
    nameKey: 'home.sponsors.partners.unesco.name',
    categoryKey: 'home.sponsors.partners.unesco.category',
  },
  {
    id: 'gem',
    name: 'GRAND EGYPTIAN MUSEUM',
    category: 'CULTURAL INSTITUTION',
    nameKey: 'home.sponsors.partners.gem.name',
    categoryKey: 'home.sponsors.partners.gem.category',
  },
  {
    id: 'egyptair',
    name: 'EGYPTAIR',
    category: 'NATIONAL CARRIER',
    nameKey: 'home.sponsors.partners.egyptair.name',
    categoryKey: 'home.sponsors.partners.egyptair.category',
  },
  {
    id: 'nmec',
    name: 'NMEC FUSTAT',
    category: 'CIVILIZATION MUSEUM',
    nameKey: 'home.sponsors.partners.nmec.name',
    categoryKey: 'home.sponsors.partners.nmec.category',
  }
];

export default function OfficialSponsorsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-24 border-t border-black/[0.04] dark:border-white/5 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Subtle Editorial Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-[11px] uppercase tracking-[0.32em] font-semibold text-stone-500 dark:text-stone-400">
            {t('home.sponsors.header')}
          </span>
          <div className="w-8 h-[1px] bg-[#C5A869]/40 mx-auto mt-3" />
        </div>

        {/* Monochromatic Greyscale Logo Marks */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 items-center">
          {PARTNERS.map((partner) => {
            const partnerName = t(partner.nameKey);
            const partnerCat = t(partner.categoryKey);
            return (
              <div
                key={partner.id}
                className="group flex flex-col items-center justify-center min-h-[120px] p-6 rounded-2xl bg-[#F8F3E9] dark:bg-[#131A2A] border border-slate-200/80 dark:border-white/5 shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300 hover:border-[#D4AF37]/40 cursor-default"
              >
                <div className="opacity-75 group-hover:opacity-100 transition-opacity duration-300 text-center flex flex-col items-center justify-center">
                  <p className="text-[11px] font-bold tracking-wider text-[#1A2332] dark:text-gray-100 uppercase leading-snug">
                    {partnerName !== partner.nameKey ? partnerName : partner.name}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-gray-400 mt-1.5">
                    {partnerCat !== partner.categoryKey ? partnerCat : partner.category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimalist Footnote */}
        <div className="text-center mt-12">
          <p className="text-[11px] text-stone-500 dark:text-stone-400 tracking-wide font-light">
            {t('home.sponsors.footnote')}
          </p>
        </div>

      </div>
    </section>
  );
}
