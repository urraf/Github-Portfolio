/**
 * Email notification system for blog publishing.
 * Uses Nodemailer with Gmail SMTP.
 * 
 * Required env vars:
 *   EMAILJS_SERVICE_ID
 *   EMAILJS_TEMPLATE_ID
 *   EMAILJS_PUBLIC_KEY
 *   EMAILJS_PRIVATE_KEY
 *   NOTIFICATION_EMAIL - Where to receive notifications
 */

export interface BlogNotificationData {
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  source?: 'cron-ai' | 'manual' | 'ai-writer';
}

export async function notifyBlogPublished(blog: BlogNotificationData) {
  const email = process.env.NOTIFICATION_EMAIL;
  
  if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !email) {
    console.warn('[EmailJS] Keys not configured, skipping notification');
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://github-portfolio-kghg.onrender.com';
  const blogUrl = `${siteUrl}/blog/${blog.slug}`;
  const sourceLabel = blog.source === 'cron-ai' ? '🤖 Auto-Generated (Cron)' 
                    : blog.source === 'ai-writer' ? '🤖 AI Writer (Manual)' 
                    : '✍️ Manual';

  const templateParams = {
    to_email: email,
    blog_title: blog.title,
    blog_url: blogUrl,
    blog_source: sourceLabel,
    blog_category: blog.category || 'Uncategorized',
    blog_tags: blog.tags ? blog.tags.join(', ') : 'None',
    blog_excerpt: blog.excerpt || 'No excerpt provided.',
    blog_image: blog.imageUrl || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: templateParams
      })
    });

    if (response.ok) {
      console.log(`[EmailJS] ✅ Notification sent successfully to ${email}`);
    } else {
      const errorText = await response.text();
      console.error(`[EmailJS] Failed to send notification. Status: ${response.status} - ${errorText}`);
    }
  } catch (err) {
    console.error('[EmailJS] Request failed:', err);
  }
}
