'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectCard, type ProjectCardProps } from '@/components/shared/project-card';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface ProjectsResponse {
  data: ProjectCardProps[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function ProjectsPageClient() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    fetch('/api/v1/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
      .catch(() => {});
  }, []);

  const fetchProjects = useCallback(async (p: number, q: string, catId: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '12' });
      if (q) params.set('search', q);
      if (catId) params.set('categoryId', catId);
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
  }, []);

  useEffect(() => {
    fetchProjects(page, search, selectedCategory);
  }, [page, search, selectedCategory, fetchProjects]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearch('');
    setPage(1);
  };

  const selectCat = (id: string) => {
    setSelectedCategory(id);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">پروژه‌ها</h1>
        <p className="mt-1 text-muted-foreground">
          پروژه‌های مناسب خود را پیدا کنید
          {!loading && <span className="mr-2">({total.toLocaleString('fa-IR')} پروژه)</span>}
        </p>
      </div>

      <div className="mb-6 flex gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="جستجو در پروژه‌ها..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10"
            />
          </div>
          <Button type="submit">جستجو</Button>
        </form>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          فیلتر
        </Button>
      </div>

      {showFilters && (
        <div className="mb-6 rounded-xl border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">دسته‌بندی</p>
            {(selectedCategory || search) && (
              <button type="button" className="text-xs text-muted-foreground hover:text-primary" onClick={clearFilters}>
                پاک کردن فیلترها
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectCat('')}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                !selectedCategory ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary'
              }`}
            >
              همه
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCat(cat.id)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selectedCategory === cat.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {(selectedCategory || search) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">فیلترهای فعال:</span>
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
              <button onClick={() => { setSelectedCategory(''); setPage(1); }}><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {search && (
            <Badge variant="secondary" className="gap-1">
              جستجو: {search}
              <button onClick={() => { setSearch(''); setPage(1); }}><X className="h-3 w-3" /></button>
            </Badge>
          )}
        </div>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">پروژه‌ای یافت نشد.</p>
          <p className="mt-1 text-sm text-muted-foreground">فیلترهای خود را تغییر دهید یا بعداً مراجعه کنید.</p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>قبلی</Button>
          <span className="text-sm text-muted-foreground">
            صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>بعدی</Button>
        </div>
      )}
    </div>
  );
}
