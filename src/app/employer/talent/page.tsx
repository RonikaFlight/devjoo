'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { UserSearch, Star, MapPin } from 'lucide-react';
import Link from 'next/link';

const placeholderFreelancers = [
  {
    id: '1',
    name: 'علی محمدی',
    headline: 'توسعه‌دهنده فول‌استک | React & Node.js',
    rating: 4.8,
    reviews: 24,
    city: 'تهران',
    skills: ['React', 'Next.js', 'Node.js', 'TypeScript'],
  },
  {
    id: '2',
    name: 'سارا احمدی',
    headline: 'طراح UI/UX | متخصص فلاتر',
    rating: 4.9,
    reviews: 31,
    city: 'اصفهان',
    skills: ['Figma', 'Flutter', 'UI Design', 'Prototyping'],
  },
  {
    id: '3',
    name: 'محمد رضایی',
    headline: 'متخصص پایتون و هوش مصنوعی',
    rating: 4.7,
    reviews: 18,
    city: 'شیراز',
    skills: ['Python', 'Machine Learning', 'Django', 'TensorFlow'],
  },
];

export default function EmployerTalentPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/employer">داشبورد</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>استخدام</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">استعدادیابی</h1>
        <p className="mt-1 text-text-secondary">
          بهترین فریلنسرها را بر اساس مهارت و تخصص پیدا کنید
        </p>
      </div>

      {/* Search bar */}
      <div className="rounded-xl border border-border bg-surface p-3">
        <input
          type="text"
          placeholder="جستجو بر اساس مهارت، نام یا تخصص..."
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          dir="rtl"
        />
      </div>

      {/* Freelancers grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderFreelancers.map((f) => (
          <Card key={f.id} className="card-base border-0">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">{f.name}</h3>
                    <p className="mt-0.5 text-sm text-text-muted">{f.headline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {f.rating}
                    <span>({f.reviews})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {f.city}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {f.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-primary-soft px-2 py-0.5 text-xs text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/freelancers/${f.id}`}>مشاهده پروفایل</Link>
                  </Button>
                  <Button size="sm" className="flex-1">
                    دعوت به پروژه
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
