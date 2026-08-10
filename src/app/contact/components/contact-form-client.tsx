'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ContactFormClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success('پیام شما با موفقیت ارسال شد. به زودی پاسخ خواهیم داد.');
    setName('');
    setEmail('');
    setMessage('');
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="contact-name">نام و نام خانوادگی</Label>
        <Input
          id="contact-name"
          placeholder="مثلاً: علی محمدی"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">ایمیل</Label>
        <Input
          id="contact-email"
          type="email"
          placeholder="example@email.com"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">پیام</Label>
        <Textarea
          id="contact-message"
          placeholder="پیام خود را بنویسید..."
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="ml-2 h-4 w-4" />
        )}
        ارسال پیام
      </Button>
    </form>
  );
}
