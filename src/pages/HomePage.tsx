import React from 'react';
import Layout from '../components/Layout';
import { HomeHero } from '../components/HomeHero';
import { FeaturedProperties } from '../components/FeaturedProperties';
import { FeaturedCities } from '../components/FeaturedCities';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { HomeCallToAction } from '../components/HomeCallToAction';
import { featuredProperties, featuredCities } from '../lib/mockData';

export default function HomePage() {
  return (
    <Layout>
      <HomeHero />
      <FeaturedProperties properties={featuredProperties} />
      <FeaturedCities cities={featuredCities} />
      <WhyChooseUs />
      <HomeCallToAction />
    </Layout>
  );
}