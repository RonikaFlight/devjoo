'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProjectCard, type ProjectCardProps } from '@/components/shared/project-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils/currency';

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  projectCount: number;
  skills: { id: string; name: string; slug: string }[];
}

interface ProjectsResponse {
  data: ProjectCardProps[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function CategoryProjectsClient({ category }: { category: CategoryData }) {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skillId') || '');

  const fetchProjects = useCallback(async (p: number, q: string, skillId: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: '12',
        categoryId: category.id,
      });
      if (q) params.set('search', q);
      if (skillId) params.set('skillId', skillId);
      const res = await fetch(`/api/v1/projects?${params}`);
      const data: ProjectsResponse = await res.json();
      setProjects(data.data || []);
      setTotal(data.meta?.total || 0);
      setTotalPages(data.meta?.totalPages || 1);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [category.id]);

  useEffect(() => {
    fetchProjects(page, search, selectedSkill);
  }, [page, search, selectedSkill, fetchProjects]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const selectSkill = (id: string) => {
    setSelectedSkill(id === selectedSkill ? '' : id);
    setPage(1);
  };

  return (
    <div>
      {/* Category Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{category.name}</h1>
        <p className="mt-2 text-muted-foreground">{category.description}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {formatNumber(category.projectCount)}
          </span>{' '}
          پروژه فعال
          {!loading && total > 0 && (
            <>
              {' '}(نمایش {formatNumber(projects.length)} از {formatNumber(total)})
            </>
          )}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`جستجو در ${category.name}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10"
            />
          </div>
          <Button type="submit">جستجو</Button>
        </form>
      </div>

      {/* Skills Filter Bar */}
      {category.skills.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium">مهارت‌ها:</span>
            {(selectedSkill || search) && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-primary"
                onClick={() => { setSelectedSkill(''); setSearch(''); setPage(1); }}
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectSkill('')}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                !selectedSkill ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary'
              }`}
            >
              همه
            </button>
            {category.skills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => selectSkill(skill.id)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selectedSkill === skill.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary'
                }`}
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(selectedSkill || search) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">فیلترهای فعال:</span>
          {selectedSkill && (
            <Badge variant="secondary" className="gap-1">
              {category.skills.find((s) => s.id === selectedSkill)?.name || selectedSkill}
              <button onClick={() => { setSelectedSkill(''); setPage(1); }}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {search && (
            <Badge variant="secondary" className="gap-1">
              جستجو: {search}
              <button onClick={() => { setSearch(''); setPage(1); }}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Projects Grid */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            پروژه‌ای در این دسته‌بندی یافت نشد.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            فیلترهای خود را تغییر دهید یا{' '}
            <Link href="/projects" className="text-primary hover:underline">
              همه پروژه‌ها
            </Link>{' '}
            را مشاهده کنید.
          </p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            قبلی
          </Button>
          <span className="text-sm text-muted-foreground">
            صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            بعدی
          </Button>
        </div>
      )}

      {/* Internal Linking: Related Categories */}
      <div className="mt-12 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">سایر دسته‌بندی‌ها</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/categories"
            className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-primary-soft hover:text-primary transition-colors"
          >
            همه دسته‌بندی‌ها
          </Link>
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-8 rounded-xl border border-border p-6">
        <h2 className="mb-3 text-lg font-semibold">پروژه‌های {category.name}</h2>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            اگر در حوزه {category.name} تخصص دارید، در این صفحه می‌توانید پروژه‌های فریلنسری
            مرتبط را پیدا کنید. کارفرمایان مختلف پروژه‌های خود را در دسته‌بندی{' '}
            {category.name} ثبت می‌کنند و شما می‌توانید پیشنهاد خود را ارسال کنید.
          </p>
          <p>
            برای مشاهده فرصت‌های بیشتر، می‌توانید مهارت‌های مرتبط را فیلتر کنید یا از{' '}
            <Link href="/categories" className="text-primary hover:underline">
              سایر دسته‌بندی‌ها
            </Link>{' '}
            بازدید کنید.
          </p>
        </div>
      </div>
    </div>
  );
}
