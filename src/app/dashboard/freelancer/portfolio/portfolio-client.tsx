'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, ExternalLink, ImageIcon } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  projectUrl: string | null;
  displayOrder: number;
  createdAt: string;
}

const emptyForm = {
  title: '',
  description: '',
  imageUrl: '',
  projectUrl: '',
};

export default function PortfolioClient() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/portfolio');
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      projectUrl: item.projectUrl || '',
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('عنوان الزامی است.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const body = {
        title: form.title,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        projectUrl: form.projectUrl || undefined,
      };

      const url = editingId
        ? `/api/v1/portfolio/${editingId}`
        : '/api/v1/portfolio';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || 'خطا در ذخیره نمونه‌کار.');
        return;
      }

      setDialogOpen(false);
      fetchItems();
    } catch {
      setError('خطا در ارتباط با سرور.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این نمونه‌کار اطمینان دارید؟')) return;

    try {
      const res = await fetch(`/api/v1/portfolio/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      // silent
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">نمونه‌کارها</h1>
          <p className="mt-1 text-muted-foreground">
            نمونه‌کارهای خود را مدیریت کنید تا کارفرماها توانایی‌های شما را ببینند.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="ml-2 h-4 w-4" />
              افزودن نمونه‌کار
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'ویرایش نمونه‌کار' : 'افزودن نمونه‌کار جدید'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">عنوان *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثلاً: طراحی وب‌سایت فروشگاهی"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="توضیح مختصری از پروژه و نقش شما..."
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">آدرس تصویر</Label>
                <Input
                  id="imageUrl"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  dir="ltr"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="projectUrl">لینک پروژه</Label>
                <Input
                  id="projectUrl"
                  value={form.projectUrl}
                  onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
                  placeholder="https://example.com"
                  dir="ltr"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting
                    ? 'در حال ذخیره...'
                    : editingId
                      ? 'ذخیره تغییرات'
                      : 'افزودن'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  انصراف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">هنوز نمونه‌کاری ندارید</h3>
          <p className="mt-2 text-muted-foreground">
            با افزودن نمونه‌کارها، شانس دیده شدن توسط کارفرماها را افزایش دهید.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="ml-2 h-4 w-4" />
            افزودن اولین نمونه‌کار
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.imageUrl ? (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-muted">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              {item.description && (
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              )}
              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="ml-1 h-4 w-4" />
                  ویرایش
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="ml-1 h-4 w-4" />
                  حذف
                </Button>
                {item.projectUrl && (
                  <a
                    href={item.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-auto"
                  >
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="ml-1 h-4 w-4" />
                      مشاهده
                    </Button>
                  </a>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}