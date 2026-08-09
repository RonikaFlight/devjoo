'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProjectCard, type ProjectCardProps } from '@/components/shared/project-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils/currency';

interface SkillData {
  id: string;
  name: string;
  slug: string;
  category: { id: string; name: string; slug: string } | null;
  synonyms: string[];
}

interface RelatedSkill {
  id: string;
  name: string;
  slug: string;
}

interface ProjectsResponse {
  data: ProjectCardProps[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function SkillProjectsClient({
  skill,
  relatedSkills,
}: {
  skill: SkillData;
  relatedSkills: RelatedSkill[];
}) {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const fetchProjects = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '12' });
      if (q) params.set('search', q);
      // Search by skill name in the query
      params.set('search', q ? `${skill.name} ${q}` : skill.name);
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
  }, [skill.name]);

  useEffect(() => {
    fetchProjects(page, search);
  }, [page, search, fetchProjects]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div>
      {/* Skill Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold sm:text-3xl">پروژه‌های {skill.name}</h1>
        </div>
        <p className="text-muted-foreground">
          {skill.category && (
            <Link
              href={`/projects/${skill.category.slug}`}
              className="text-primary hover:underline"
            >
              {skill.category.name}
            </Link>
          )}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {!loading && total > 0 && (
            <>
              <span className="font-semibold text-foreground">
                {formatNumber(total)}
              </span>{' '}
              پروژه مرتبط با {skill.name}
            </>
          )}
        </p>
        {skill.synonyms.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skill.synonyms.map((syn) => (
              <Badge key={syn} variant="outline" className="text-xs">
                {syn}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`جستجو در پروژه‌های ${skill.name}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10"
            />
          </div>
          <Button type="submit">جستجو</Button>
        </form>
      </div>

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
            پروژه‌ای برای {skill.name} یافت نشد.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
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

      {/* Related Skills */}
      {relatedSkills.length > 0 && (
        <div className="mt-12 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">مهارت‌های مرتبط</h2>
          <div className="flex flex-wrap gap-2">
            {relatedSkills.map((rs) => (
              <Link
                key={rs.id}
                href={`/projects/skills/${rs.slug}`}
                className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-primary-soft hover:text-primary transition-colors"
              >
                {rs.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hire CTA */}
      <div className="mt-8 rounded-xl border border-primary/20 bg-primary-soft p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">نیاز به فریلنسر {skill.name} دارید؟</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              متخصصین {skill.name} را در DevJoo پیدا کنید.
            </p>
          </div>
          <Link href="/hire">
            <Button>استخدام متخصص</Button>
          </Link>
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-8 rounded-xl border border-border p-6">
        <h2 className="mb-3 text-lg font-semibold">فریلنسر {skill.name}</h2>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            اگر به دنبال پروژه‌های {skill.name} هستید یا نیاز به استخدام فریلنسر {skill.name} دارید،
            DevJoo بهترین پلتفرم برای پیدا کردن متخصصین و پروژه‌های مرتبط با {skill.name} است.
            فریلنسرهای ما در حوزه {skill.name} تجربه و تخصص بالایی دارند.
          </p>
          <p>
            {skill.category && (
              <>
                مهارت {skill.name} در دسته‌بندی{' '}
                <Link
                  href={`/projects/${skill.category.slug}`}
                  className="text-primary hover:underline"
                >
                  {skill.category.name}
                </Link>{' '}
                قرار دارد و پروژه‌های مرتبط با سایر مهارت‌های این حوزه را نیز می‌توانید
                مشاهده کنید.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
