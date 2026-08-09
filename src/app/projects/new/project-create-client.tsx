'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-client';
import { toast } from 'sonner';
import { toEnglishDigits, formatNumber } from '@/lib/utils/currency';
import {
  BUDGET_TYPE_LABELS,
  WORK_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  type BudgetType,
  type WorkType,
  type ExperienceLevel,
} from '@/types/enums';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, ChevronLeft, Loader2, X, Plus } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface Skill {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  category?: { name: string; slug: string } | null;
}

interface FormErrors {
  [key: string]: string;
}

const STEPS = [
  { num: '۱', label: 'اطلاعات اصلی' },
  { num: '۲', label: 'دسته‌بندی و مهارت‌ها' },
  { num: '۳', label: 'بودجه و جزئیات' },
] as const;

// ── Component ────────────────────────────────────────────────────

export function ProjectCreateClient() {
  const { isLoggedIn, isEmployer, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Step
  const [step, setStep] = useState(0);

  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budgetType, setBudgetType] = useState<BudgetType>('FIXED');
  const [fixedPriceToman, setFixedPriceToman] = useState('');
  const [hourlyMinToman, setHourlyMinToman] = useState('');
  const [hourlyMaxToman, setHourlyMaxToman] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('');
  const [workType, setWorkType] = useState<WorkType>('REMOTE');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [city, setCity] = useState('');
  const [proposalLimit, setProposalLimit] = useState('10');
  const [deadline, setDeadline] = useState('');

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  // ── Fetch categories & skills ─────────────────────────────────

  useEffect(() => {
    fetch('/api/v1/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
      .catch(() => {});
    fetch('/api/v1/skills?limit=200')
      .then((r) => r.json())
      .then((d) => setAllSkills(d.data || []))
      .catch(() => {});
  }, []);

  // Filter skills by selected category
  const filteredSkillsByCategory = useMemo(() => {
    if (!categoryId) return allSkills;
    return allSkills.filter((s) => s.category?.slug && categories.find((c) => c.id === categoryId && c.slug === s.category?.slug));
  }, [categoryId, allSkills, categories]);

  // Search within filtered skills
  const displayedSkills = useMemo(() => {
    if (!skillSearch.trim()) return filteredSkillsByCategory;
    const q = skillSearch.trim().toLowerCase();
    return filteredSkillsByCategory.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q)
    );
  }, [filteredSkillsByCategory, skillSearch]);

  // Reset selected skills when category changes
  useEffect(() => {
    setSelectedSkills([]);
  }, [categoryId]);

  // ── Validation ────────────────────────────────────────────────

  const validateStep0 = useCallback((): boolean => {
    const e: FormErrors = {};
    if (title.trim().length < 10) {
      e.title = 'عنوان پروژه باید حداقل ۱۰ کاراکتر باشد';
    }
    if (description.trim().length < 30) {
      e.description = 'توضیحات پروژه باید حداقل ۳۰ کاراکتر باشد';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [title, description]);

  const validateStep1 = useCallback((): boolean => {
    const e: FormErrors = {};
    if (!categoryId) {
      e.categoryId = 'دسته‌بندی الزامی است';
    }
    if (selectedSkills.length === 0) {
      e.skills = 'حداقل یک مهارت انتخاب کنید';
    }
    if (selectedSkills.length > 10) {
      e.skills = 'حداکثر ۱۰ مهارت می‌توانید انتخاب کنید';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [categoryId, selectedSkills]);

  const validateStep2 = useCallback((): boolean => {
    const e: FormErrors = {};
    if (budgetType === 'FIXED') {
      const val = parseInt(toEnglishDigits(fixedPriceToman), 10);
      if (!fixedPriceToman || isNaN(val) || val < 10000) {
        e.fixedPrice = 'مبلغ پروژه الزامی است (حداقل ۱۰,۰۰۰ تومان)';
      }
    } else {
      const min = parseInt(toEnglishDigits(hourlyMinToman), 10);
      const max = parseInt(toEnglishDigits(hourlyMaxToman), 10);
      if (!hourlyMinToman || isNaN(min) || min < 10000) {
        e.hourlyMin = 'حداقل نرخ ساعتی الزامی است';
      }
      if (!hourlyMaxToman || isNaN(max) || max < 10000) {
        e.hourlyMax = 'حداکثر نرخ ساعتی الزامی است';
      }
      if (!isNaN(min) && !isNaN(max) && min > max) {
        e.hourlyMax = 'حداکثر نرخ نباید کمتر از حداقل باشد';
      }
    }
    const pl = parseInt(toEnglishDigits(proposalLimit), 10);
    if (isNaN(pl) || pl < 3 || pl > 20) {
      e.proposalLimit = 'تعداد پیشنهاد باید بین ۳ تا ۲۰ باشد';
    }
    if (deadline) {
      const d = new Date(deadline);
      if (isNaN(d.getTime()) || d <= new Date()) {
        e.deadline = 'مهلت باید یک تاریخ آینده باشد';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [budgetType, fixedPriceToman, hourlyMinToman, hourlyMaxToman, proposalLimit, deadline]);

  // ── Step navigation ───────────────────────────────────────────

  const goNext = () => {
    if (step === 0 && validateStep0()) setStep(1);
    else if (step === 1 && validateStep1()) setStep(2);
  };

  const goBack = () => {
    setErrors({});
    setStep(Math.max(0, step - 1));
  };

  // ── Skill toggle ──────────────────────────────────────────────

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skillId)) return prev.filter((id) => id !== skillId);
      if (prev.length >= 10) {
        toast.error('حداکثر ۱۰ مهارت می‌توانید انتخاب کنید');
        return prev;
      }
      return [...prev, skillId];
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.skills;
      return next;
    });
  };

  const getSkillName = (id: string) => allSkills.find((s) => s.id === id)?.name || id;

  // ── Submit ────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        skills: selectedSkills,
        budgetType,
        workType,
        proposalLimit: parseInt(toEnglishDigits(proposalLimit), 10),
      };

      if (budgetType === 'FIXED') {
        body.fixedPriceRial = parseInt(toEnglishDigits(fixedPriceToman), 10) * 10;
      } else {
        body.budgetMinRial = parseInt(toEnglishDigits(hourlyMinToman), 10) * 10;
        body.budgetMaxRial = parseInt(toEnglishDigits(hourlyMaxToman), 10) * 10;
      }

      if (experienceLevel) body.experienceLevel = experienceLevel;
      if (estimatedDuration.trim()) body.estimatedDuration = estimatedDuration.trim();
      if (workType === 'ONSITE' || workType === 'HYBRID') {
        if (city.trim()) body.city = city.trim();
      }
      if (deadline) body.deadline = new Date(deadline).toISOString();

      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error?.message || 'خطایی در ایجاد پروژه رخ داد';
        toast.error(msg);
        return;
      }

      const slug = data.data?.slug;
      if (slug) {
        setCreatedSlug(slug);
        toast.success('پروژه شما با موفقیت ایجاد شد!');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!createdSlug) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/v1/projects/${createdSlug}/publish`, {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('پروژه با موفقیت منتشر شد!');
        router.push(`/project/${createdSlug}`);
      } else {
        const data = await res.json();
        toast.error(data?.error?.message || 'خطا در انتشار پروژه');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setPublishing(false);
    }
  };

  // ── Auth gate ─────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Card>
          <CardContent className="py-12">
            <h2 className="mb-4 text-xl font-bold">ابتدا وارد حساب کاربری شوید</h2>
            <p className="mb-6 text-muted-foreground">
              برای ثبت پروژه جدید باید وارد حساب کاربری خود شوید.
            </p>
            <Button asChild>
              <Link href="/auth/login">ورود به حساب کاربری</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isEmployer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Card>
          <CardContent className="py-12">
            <h2 className="mb-4 text-xl font-bold">دسترسی محدود</h2>
            <p className="mb-6 text-muted-foreground">
              ثبت پروژه تنها برای کارفرماها امکان‌پذیر است. شما به عنوان فریلنسر ثبت‌نام کرده‌اید.
            </p>
            <Button asChild variant="outline">
              <Link href="/projects">مشاهده پروژه‌ها</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Success screen ────────────────────────────────────────────

  if (createdSlug) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">پروژه شما ایجاد شد!</h2>
            <p className="mb-8 text-muted-foreground">
              پروژه شما در وضعیت پیش‌نویس ذخیره شده است. می‌توانید آن را منتشر کنید یا بعداً ویرایش نمایید.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={handlePublish} disabled={publishing}>
                {publishing && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                انتشار پروژه
              </Button>
              <Button asChild variant="outline">
                <Link href={`/project/${createdSlug}`}>مشاهده پروژه</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/dashboard/employer">بازگشت به داشبورد</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">ثبت پروژه جدید</h1>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  i < step
                    ? 'bg-primary text-primary-foreground'
                    : i === step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span
                className={`hidden text-sm sm:inline ${
                  i <= step ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-8 sm:w-16 ${
                    i < step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Basics */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات اصلی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                عنوان پروژه <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="مثلاً: طراحی و توسعه وب‌سایت فروشگاهی با Next.js"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((p) => { const n = { ...p }; delete n.title; return n; });
                }}
                maxLength={150}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {errors.title ? (
                  <span className="text-red-500">{errors.title}</span>
                ) : (
                  <span> </span>
                )}
                <span>{formatNumber(title.length)} / {formatNumber(150)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                توضیحات پروژه <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="جزئیات پروژه، نیازمندی‌ها، و هر اطلاعاتی که به فریلنسرها کمک کند بهتر پیشنهاد بدهند...
                
بهتر است شامل:
- نوع پروژه و هدف آن
- تکنولوژی‌های مورد نیاز
- ویژگی‌های اصلی
- هر محدودیت یا نیازی"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((p) => { const n = { ...p }; delete n.description; return n; });
                }}
                rows={8}
                maxLength={10000}
                className="resize-y"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {errors.description ? (
                  <span className="text-red-500">{errors.description}</span>
                ) : (
                  <span> </span>
                )}
                <span>{formatNumber(description.length)} / {formatNumber(10000)}</span>
              </div>
            </div>

            <div className="flex justify-start">
              <Button onClick={goNext}>
                مرحله بعد
                <ChevronLeft className="ms-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Category & Skills */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>دسته‌بندی و مهارت‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">
                دسته‌بندی <span className="text-red-500">*</span>
              </Label>
              <Select
                value={categoryId}
                onValueChange={(val) => {
                  setCategoryId(val);
                  if (errors.categoryId) setErrors((p) => { const n = { ...p }; delete n.categoryId; return n; });
                }}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="انتخاب دسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                مهارت‌های مورد نیاز <span className="text-red-500">*</span>
              </Label>

              {/* Selected skills badges */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((id) => (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="cursor-pointer gap-1"
                      onClick={() => toggleSkill(id)}
                    >
                      {getSkillName(id)}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}

              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills}</p>
              )}

              {selectedSkills.length < 10 && (
                <>
                  <Input
                    placeholder="جستجوی مهارت..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                  />
                  <div className="max-h-48 overflow-y-auto rounded-md border p-2">
                    {displayedSkills.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        مهارتی یافت نشد
                      </p>
                    ) : (
                      displayedSkills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => toggleSkill(skill.id)}
                            className={`flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors text-start ${
                              isSelected
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted'
                            }`}
                          >
                            {isSelected ? (
                              <Check className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            {skill.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              <p className="text-xs text-muted-foreground">
                {formatNumber(selectedSkills.length)} از {formatNumber(10)} مهارت انتخاب شده
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={goBack}>
                <ChevronLeft className="me-2 h-4 w-4 rotate-180" />
                مرحله قبل
              </Button>
              <Button onClick={goNext}>
                مرحله بعد
                <ChevronLeft className="ms-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Budget & Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>بودجه و جزئیات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Budget type */}
            <div className="space-y-2">
              <Label>نوع بودجه</Label>
              <RadioGroup
                value={budgetType}
                onValueChange={(val) => setBudgetType(val as BudgetType)}
                className="flex gap-4"
              >
                {(Object.entries(BUDGET_TYPE_LABELS) as [BudgetType, string][]).map(
                  ([value, label]) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem value={value} id={`budget-${value}`} />
                      <Label htmlFor={`budget-${value}`} className="cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  )
                )}
              </RadioGroup>
            </div>

            {/* Budget amount */}
            {budgetType === 'FIXED' ? (
              <div className="space-y-2">
                <Label htmlFor="fixedPrice">
                  مبلغ پروژه (تومان) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fixedPrice"
                  type="text"
                  inputMode="numeric"
                  placeholder="مثلاً ۵,۰۰۰,۰۰۰"
                  value={fixedPriceToman}
                  onChange={(e) => {
                    setFixedPriceToman(e.target.value);
                    if (errors.fixedPrice) setErrors((p) => { const n = { ...p }; delete n.fixedPrice; return n; });
                  }}
                />
                {errors.fixedPrice ? (
                  <p className="text-sm text-red-500">{errors.fixedPrice}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    مبلغ وارد شده در تومان است و به صورت خودکار به ریال (×۱۰) تبدیل می‌شود.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyMin">
                    حداقل نرخ ساعتی (تومان) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hourlyMin"
                    type="text"
                    inputMode="numeric"
                    placeholder="مثلاً ۱۰۰,۰۰۰"
                    value={hourlyMinToman}
                    onChange={(e) => {
                      setHourlyMinToman(e.target.value);
                      if (errors.hourlyMin) setErrors((p) => { const n = { ...p }; delete n.hourlyMin; return n; });
                    }}
                  />
                  {errors.hourlyMin && (
                    <p className="text-sm text-red-500">{errors.hourlyMin}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyMax">
                    حداکثر نرخ ساعتی (تومان) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hourlyMax"
                    type="text"
                    inputMode="numeric"
                    placeholder="مثلاً ۳۰۰,۰۰۰"
                    value={hourlyMaxToman}
                    onChange={(e) => {
                      setHourlyMaxToman(e.target.value);
                      if (errors.hourlyMax) setErrors((p) => { const n = { ...p }; delete n.hourlyMax; return n; });
                    }}
                  />
                  {errors.hourlyMax ? (
                    <p className="text-sm text-red-500">{errors.hourlyMax}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      مبلغ در تومان (×۱۰ ریال)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Experience level */}
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">سطح تجربه مورد نیاز</Label>
              <Select
                value={experienceLevel}
                onValueChange={(val) => setExperienceLevel(val as ExperienceLevel)}
              >
                <SelectTrigger id="experienceLevel">
                  <SelectValue placeholder="انتخاب سطح (اختیاری)" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(EXPERIENCE_LEVEL_LABELS) as [ExperienceLevel, string][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Work type */}
            <div className="space-y-2">
              <Label>نوع همکاری</Label>
              <RadioGroup
                value={workType}
                onValueChange={(val) => setWorkType(val as WorkType)}
                className="flex gap-4"
              >
                {(Object.entries(WORK_TYPE_LABELS) as [WorkType, string][]).map(
                  ([value, label]) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem value={value} id={`work-${value}`} />
                      <Label htmlFor={`work-${value}`} className="cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  )
                )}
              </RadioGroup>
            </div>

            {/* City (for ONSITE/HYBRID) */}
            {(workType === 'ONSITE' || workType === 'HYBRID') && (
              <div className="space-y-2">
                <Label htmlFor="city">شهر</Label>
                <Input
                  id="city"
                  placeholder="مثلاً: تهران"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  maxLength={100}
                />
              </div>
            )}

            {/* Duration & Deadline row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">مدت تخمینی پروژه</Label>
                <Input
                  id="duration"
                  placeholder="مثلاً: ۲ هفته، ۱ ماه"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">مهلت ارسال پیشنهاد</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    if (errors.deadline) setErrors((p) => { const n = { ...p }; delete n.deadline; return n; });
                  }}
                />
                {errors.deadline && (
                  <p className="text-sm text-red-500">{errors.deadline}</p>
                )}
              </div>
            </div>

            {/* Proposal limit */}
            <div className="space-y-2">
              <Label htmlFor="proposalLimit">
                حداکثر تعداد پیشنهاد
              </Label>
              <Input
                id="proposalLimit"
                type="text"
                inputMode="numeric"
                value={proposalLimit}
                onChange={(e) => {
                  setProposalLimit(e.target.value);
                  if (errors.proposalLimit) setErrors((p) => { const n = { ...p }; delete n.proposalLimit; return n; });
                }}
              />
              {errors.proposalLimit ? (
                <p className="text-sm text-red-500">{errors.proposalLimit}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  بین ۳ تا ۲۰ (پیش‌فرض: ۱۰)
                </p>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={goBack}>
                <ChevronLeft className="me-2 h-4 w-4 rotate-180" />
                مرحله قبل
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                ایجاد پروژه
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
