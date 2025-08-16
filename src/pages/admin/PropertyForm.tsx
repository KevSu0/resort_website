import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useLoaderData } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Card } from '../../components/Layout';
import { toast } from '../../hooks/useToast';
import { MockDataService } from '../../lib/mockData';
import type { Property } from '../../types';

const propertySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function AdminPropertyForm() {
  const navigate = useNavigate();
  const property = useLoaderData() as Property | null;

  const isEditMode = Boolean(property);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      slug: '',
      price: 0,
      description: '',
    },
  });

  useEffect(() => {
    if (isEditMode && property) {
      reset({
        name: property.name,
        slug: property.slug,
        price: property.price,
        description: property.branding.description,
      });
    }
  }, [isEditMode, property, reset]);

  const onSubmit = async (data: PropertyFormData) => {
    try {
      if (isEditMode && property) {
        const updatedProperty: Partial<Property> = {
          name: data.name,
          slug: data.slug,
          price: data.price,
          branding: {
            ...property.branding,
            description: data.description,
          },
        };
        await MockDataService.updateProperty(property.id, updatedProperty);
        toast({ title: 'Property Updated', description: `${data.name} has been updated successfully.` });
      } else {
        const newProperty: Omit<Property, 'id' | 'created_at' | 'updated_at'> = {
          name: data.name,
          slug: data.slug,
          price: data.price,
          active: true,
          featured: false,
          city_slug: 'bali', // Placeholder
          location: { address: 'Placeholder Address', coordinates: { lat: 0, lng: 0 } },
          stay_types: ['villa'], // Placeholder
          branding: {
            description: data.description,
            primary_color: '#000000',
            secondary_color: '#ffffff'
          },
          managers: {},
        };
        await MockDataService.createProperty(newProperty);
        toast({ title: 'Property Created', description: `${data.name} has been created successfully.` });
      }
      navigate('/admin/properties');
    } catch {
      toast({ title: 'Error', description: 'An error occurred while saving the property.', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Property' : 'Create New Property'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? `Editing ${property?.name}` : 'Fill out the details for the new property.'}
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <input id="name" {...field} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <Controller
                name="slug"
                control={control}
                render={({ field }) => <input id="slug" {...field} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />}
              />
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price per Night ($)</label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => <input id="price" type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <textarea id="description" {...field} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => navigate('/admin/properties')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Property')}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}
