import { useState, useEffect } from 'react';
import {
  Save,
  X,
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { MediaEditor } from './MediaEditor';
import { contentService } from '../../services/contentService';
import { mediaService } from '../../services/mediaService';
import { type LandingContent } from '../../types/entities';
import { useAuth } from '../../../hooks/admin/useAuth';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  photo?: string;
  rating: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const LandingEditor: React.FC = () => {
  const { user } = useAuth();
  const [landing, setLanding] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    loadLanding();
  }, []);

  const loadLanding = async () => {
    setLoading(true);
    try {
      const draft = await contentService.loadDraft();
      setLanding(draft.landing);
    } catch (err) {
      console.error('Failed to load landing content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!landing || !user) return;

    setSaving(true);
    setErrors([]);

    try {
      await contentService.updateLandingContent(landing);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Save failed']);
    } finally {
      setSaving(false);
    }
  };

  const handleHeroImageSelect = async (media: any) => {
    if (!landing) return;

    setLanding({
      ...landing,
      hero: { ...landing.hero, backgroundImage: media.id }
    });

    // Track usage
    await mediaService.updateMediaUsage(media.id, 'Landing', 'hero', 'backgroundImage', 'add');
  };

  const addUSP = () => {
    if (!landing) return;
    setLanding({
      ...landing,
      usps: [...landing.usps, { title: '', description: '', icon: '' }]
    });
  };

  const updateUSP = (index: number, field: string, value: any) => {
    if (!landing) return;
    setLanding({
      ...landing,
      usps: landing.usps.map((usp, i) =>
        i === index ? { ...usp, [field]: value } : usp
      )
    });
  };

  const removeUSP = (index: number) => {
    if (!landing) return;
    setLanding({
      ...landing,
      usps: landing.usps.filter((_, i) => i !== index)
    });
  };

  const addTestimonial = () => {
    if (!landing) return;
    const testimonial: Testimonial = {
      id: Date.now().toString(),
      name: '',
      role: '',
      content: '',
      rating: 5
    };
    setLanding({
      ...landing,
      testimonials: [...landing.testimonials, testimonial as any]
    });
  };

  const updateTestimonial = (index: number, field: string, value: any) => {
    if (!landing) return;
    setLanding({
      ...landing,
      testimonials: landing.testimonials.map((t, i) =>
        i === index ? { ...t, [field]: value } : t
      )
    });
  };

  const removeTestimonial = (index: number) => {
    if (!landing) return;
    setLanding({
      ...landing,
      testimonials: landing.testimonials.filter((_, i) => i !== index)
    });
  };

  const addFAQ = () => {
    if (!landing) return;
    const faq: FAQ = {
      id: Date.now().toString(),
      question: '',
      answer: '',
      category: 'General'
    };
    setLanding({
      ...landing,
      faqs: [...landing.faqs, faq as any]
    });
  };

  const updateFAQ = (index: number, field: string, value: any) => {
    if (!landing) return;
    setLanding({
      ...landing,
      faqs: landing.faqs.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      )
    });
  };

  const removeFAQ = (index: number) => {
    if (!landing) return;
    setLanding({
      ...landing,
      faqs: landing.faqs.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!landing) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Landing Page</h1>
          <p className="text-gray-600">Customize your homepage content</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(previewMode === 'edit' ? 'preview' : 'edit')}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode === 'edit' ? 'Preview' : 'Edit'}
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="list-disc list-inside text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={landing.hero.title}
                  onChange={(e) => setLanding({
                    ...landing,
                    hero: { ...landing.hero, title: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={landing.hero.subtitle}
                  onChange={(e) => setLanding({
                    ...landing,
                    hero: { ...landing.hero, subtitle: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Text
                </label>
                <input
                  type="text"
                  value={landing.hero.ctaText}
                  onChange={(e) => setLanding({
                    ...landing,
                    hero: { ...landing.hero, ctaText: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Link
                </label>
                <input
                  type="text"
                  value={landing.hero.ctaLink}
                  onChange={(e) => setLanding({
                    ...landing,
                    hero: { ...landing.hero, ctaLink: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Image
              </label>
              {landing.hero.backgroundImage ? (
                <div className="relative group w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={`data:image/jpeg;base64,${localStorage.getItem(`assets/images/${landing.hero.backgroundImage}.jpg`)?.split(',')[1] || ''}`}
                    alt="Hero Background"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setLanding({
                        ...landing,
                        hero: { ...landing.hero, backgroundImage: '' }
                      })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowMediaPicker(true)}
                  className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Select Background Image</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* USPs */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Unique Selling Points</h2>
            <Button size="sm" variant="outline" onClick={addUSP}>
              <Plus className="w-4 h-4 mr-2" />
              Add USP
            </Button>
          </div>

          {landing.usps.length > 0 ? (
            <div className="space-y-4">
              {landing.usps.map((usp, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">USP #{index + 1}</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeUSP(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <input
                        type="text"
                        value={usp.icon}
                        onChange={(e) => updateUSP(index, 'icon', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., Star, MapPin, CheckCircle"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={usp.title}
                        onChange={(e) => updateUSP(index, 'title', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="USP title"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={usp.description}
                        onChange={(e) => updateUSP(index, 'description', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        rows={2}
                        placeholder="Brief description"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No USPs added
            </div>
          )}
        </div>

        {/* Testimonials */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Testimonials</h2>
            <Button size="sm" variant="outline" onClick={addTestimonial}>
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </div>

          {landing.testimonials.length > 0 ? (
            <div className="space-y-4">
              {landing.testimonials.map((testimonial, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Testimonial #{index + 1}</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeTestimonial(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={testimonial.role}
                        onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Customer role/location"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-5 h-5 cursor-pointer ${
                              star <= testimonial.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                            onClick={() => updateTestimonial(index, 'rating', star)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Testimonial
                    </label>
                    <textarea
                      value={testimonial.content}
                      onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      placeholder="Customer testimonial..."
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No testimonials added
            </div>
          )}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">FAQs</h2>
            <Button size="sm" variant="outline" onClick={addFAQ}>
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </div>

          {landing.faqs.length > 0 ? (
            <div className="space-y-4">
              {landing.faqs.map((faq, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">FAQ #{index + 1}</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFAQ(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Frequently asked question"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={faq.category}
                        onChange={(e) => updateFAQ(index, 'category', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="FAQ category"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Answer
                      </label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                        placeholder="Answer to the question"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No FAQs added
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={landing.seo.title}
                onChange={(e) => setLanding({
                  ...landing,
                  seo: { ...landing.seo, title: e.target.value }
                })}
                className="w-full border rounded px-3 py-2"
                placeholder="Page title for search engines"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                value={landing.seo.description}
                onChange={(e) => setLanding({
                  ...landing,
                  seo: { ...landing.seo, description: e.target.value }
                })}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Meta description for search results"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Background Image</h3>
              <Button variant="ghost" onClick={() => setShowMediaPicker(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <MediaEditor
                onSelect={handleHeroImageSelect}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};