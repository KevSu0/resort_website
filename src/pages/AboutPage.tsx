import React from 'react';
import { Award, Users, MapPin, Heart, Star, Shield, Leaf, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid, HeroSection } from '../components/Layout';

export default function AboutPage() {
  const stats = [
    { icon: MapPin, label: 'Properties', value: '50+', description: 'Across 15 countries' },
    { icon: Users, label: 'Happy Guests', value: '1M+', description: 'Served annually' },
    { icon: Award, label: 'Awards Won', value: '25+', description: 'Industry recognition' },
    { icon: Star, label: 'Average Rating', value: '4.8', description: 'Guest satisfaction' }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Guest-Centric Service',
      description: 'Every decision we make is guided by our commitment to creating exceptional experiences for our guests.'
    },
    {
      icon: Shield,
      title: 'Trust & Reliability',
      description: 'We build lasting relationships through transparency, consistency, and unwavering reliability.'
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'We are committed to protecting the beautiful destinations we operate in for future generations.'
    },
    {
      icon: Clock,
      title: 'Innovation',
      description: 'We continuously evolve our services and technology to exceed guest expectations.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Chief Executive Officer',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20business%20woman%20CEO%20headshot%20portrait%20in%20modern%20office%20setting%20confident%20smile%20business%20attire&image_size=portrait_4_3',
      bio: 'With over 15 years in hospitality, Sarah leads our vision of redefining luxury travel experiences.'
    },
    {
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20Asian%20male%20CTO%20headshot%20portrait%20technology%20executive%20modern%20office%20confident%20business%20attire&image_size=portrait_4_3',
      bio: 'Michael drives our digital innovation, ensuring our platform delivers seamless booking experiences.'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Head of Guest Experience',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20Latina%20woman%20hospitality%20executive%20headshot%20portrait%20warm%20smile%20business%20attire%20modern%20office&image_size=portrait_4_3',
      bio: 'Elena ensures every guest interaction exceeds expectations through personalized service excellence.'
    },
    {
      name: 'David Thompson',
      role: 'Director of Operations',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20male%20operations%20director%20headshot%20portrait%20business%20executive%20confident%20modern%20office%20setting&image_size=portrait_4_3',
      bio: 'David oversees our global operations, maintaining the highest standards across all properties.'
    }
  ];

  const milestones = [
    { year: '2010', title: 'Company Founded', description: 'Started with a single boutique resort in Miami Beach' },
    { year: '2013', title: 'First International Property', description: 'Expanded to Cancun, Mexico with our first international resort' },
    { year: '2016', title: 'Digital Platform Launch', description: 'Launched our comprehensive booking and management platform' },
    { year: '2019', title: 'Sustainability Initiative', description: 'Committed to carbon-neutral operations by 2030' },
    { year: '2021', title: 'AI Integration', description: 'Introduced AI-powered personalization and customer service' },
    { year: '2024', title: '50+ Properties', description: 'Reached milestone of 50 properties across 15 countries' }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            About Resort Group
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Redefining luxury hospitality through exceptional experiences, 
            innovative technology, and sustainable practices.
          </p>
        </div>
      </HeroSection>

      {/* Mission Statement */}
      <Section>
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            To create unforgettable experiences that connect people with extraordinary destinations 
            while fostering sustainable tourism and supporting local communities. We believe that 
            travel has the power to transform lives, broaden perspectives, and create lasting memories.
          </p>
          <div className="bg-blue-50 rounded-2xl p-8">
            <blockquote className="text-xl font-medium text-gray-900 italic">
              "We don't just provide accommodations; we craft experiences that inspire, 
              rejuvenate, and create connections that last a lifetime."
            </blockquote>
            <cite className="block mt-4 text-blue-600 font-medium">- Sarah Johnson, CEO</cite>
          </div>
        </div>
      </Section>

      {/* Stats */}
      <Section className="bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Our Impact
          </h2>
          <p className="text-gray-600">
            Numbers that reflect our commitment to excellence
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </Card>
            );
          })}
        </Grid>
      </Section>

      {/* Our Values */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Our Values
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The principles that guide everything we do and shape our company culture
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4 flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </Grid>
      </Section>

      {/* Leadership Team */}
      <Section className="bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Leadership Team
          </h2>
          <p className="text-gray-600">
            Meet the visionaries driving our mission forward
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {member.name}
              </h3>
              <p className="text-blue-600 font-medium mb-3">{member.role}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Company Timeline */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Our Journey
          </h2>
          <p className="text-gray-600">
            Key milestones in our growth and evolution
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-px h-full w-0.5 bg-blue-200"></div>
            
            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex items-center mb-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                
                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                  <Card className="p-6">
                    <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Sustainability Commitment */}
      <Section className="bg-green-50">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Sustainability Commitment
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're dedicated to responsible tourism that preserves the beauty of our destinations
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Carbon Neutral by 2030
            </h3>
            <p className="text-gray-600">
              Committed to achieving carbon neutrality across all operations through 
              renewable energy and offset programs.
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Community Support
            </h3>
            <p className="text-gray-600">
              Supporting local communities through employment, sourcing, 
              and cultural preservation initiatives.
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Environmental Protection
            </h3>
            <p className="text-gray-600">
              Implementing water conservation, waste reduction, and 
              ecosystem protection measures at all properties.
            </p>
          </Card>
        </Grid>
      </Section>

      {/* Call to Action */}
      <Section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Join Our Journey
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience the difference that passion, innovation, and sustainability make
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Explore Properties
            </button>
            <button className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium">
              Contact Us
            </button>
          </div>
        </div>
      </Section>
    </Layout>
  );
}