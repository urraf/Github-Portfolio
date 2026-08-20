/**
 * Email notification system for blog publishing.
 * Uses Nodemailer with Gmail SMTP.
 * 
 * Required env vars:
 *   SMTP_EMAIL     - Your Gmail address (e.g., farhan@gmail.com)
 *   SMTP_PASSWORD  - Gmail App Password (NOT your regular password)
 *   NOTIFICATION_EMAIL - Where to receive notifications (can be same as SMTP_EMAIL)
 */

import nodemailer from 'nodemailer';

interface BlogNotification {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  source: 'cron-ai' | 'manual' | 'ai-writer';
}

/**
 * Send a beautiful HTML email notification when a blog is published.
 */
export async function notifyBlogPublished(blog: BlogNotification): Promise<void> {
  const email = process.env.NOTIFICATION_EMAIL || process.env.SMTP_EMAIL;
  
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD || !email) {
    console.warn('[Email] SMTP not configured, skipping notification');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://github-portfolio-kghg.onrender.com';
  const blogUrl = `${siteUrl}/blog/${blog.slug}`;
  const sourceLabel = blog.source === 'cron-ai' ? '🤖 Auto-Generated (Cron)' 
                    : blog.source === 'ai-writer' ? '🤖 AI Writer (Manual)' 
                    : '✍️ Manual';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0e17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0c1120 0%,#111b2e 100%);border:1px solid #1a2235;border-radius:16px;overflow:hidden;">
      
      <!-- Top Bar -->
      <div style="background:linear-gradient(90deg,#00d4ff,#a855f7,#00ff88);height:4px;"></div>
      
      <!-- Logo Area -->
      <div style="padding:24px 32px 16px;border-bottom:1px solid #1a2235;">
        <table cellpadding="0" cellspacing="0" width="100%"><tr>
          <td>
            <span style="color:#00ff88;font-family:monospace;font-size:14px;">$ </span>
            <span style="color:#e2e8f0;font-family:monospace;font-size:14px;font-weight:bold;">blog</span>
            <span style="color:#3d4a5c;font-family:monospace;font-size:14px;">.</span>
            <span style="color:#00d4ff;font-family:monospace;font-size:14px;">notify()</span>
          </td>
          <td style="text-align:right;">
            <span style="background:#00ff88;color:#0a0e17;font-size:11px;font-weight:bold;padding:4px 10px;border-radius:20px;font-family:monospace;">NEW POST</span>
          </td>
        </tr></table>
      </div>
      
      <!-- Cover Image -->
      ${blog.imageUrl ? `
      <div style="padding:16px 24px 0;">
        <img src="${blog.imageUrl}" alt="${blog.title}" style="width:100%;height:200px;object-fit:cover;border-radius:12px;border:1px solid #1a2235;" />
      </div>` : ''}
      
      <!-- Content -->
      <div style="padding:24px 32px;">
        
        <!-- Source Badge -->
        <div style="margin-bottom:16px;">
          <span style="background:rgba(0,212,255,0.1);color:#00d4ff;font-size:12px;padding:6px 14px;border-radius:20px;border:1px solid rgba(0,212,255,0.2);font-family:monospace;">${sourceLabel}</span>
        </div>
        
        <!-- Title -->
        <h1 style="color:#e2e8f0;font-size:22px;font-weight:bold;margin:0 0 12px;line-height:1.3;">${blog.title}</h1>
        
        <!-- Excerpt -->
        <p style="color:#7a8599;font-size:14px;line-height:1.6;margin:0 0 20px;">${blog.excerpt}</p>
        
        <!-- Meta -->
        <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr>
          <td style="padding-right:16px;">
            <span style="color:#3d4a5c;font-size:12px;font-family:monospace;">category:</span>
            <span style="color:#a855f7;font-size:12px;font-family:monospace;font-weight:bold;"> ${blog.category}</span>
          </td>
          <td>
            <span style="color:#3d4a5c;font-size:12px;font-family:monospace;">tags:</span>
            <span style="color:#00ff88;font-size:12px;font-family:monospace;"> ${blog.tags.join(', ')}</span>
          </td>
        </tr></table>
        
        <!-- CTA Button -->
        <div style="text-align:center;padding:8px 0;">
          <a href="${blogUrl}" style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#0088ff);color:#fff;font-weight:bold;font-size:14px;padding:14px 40px;border-radius:12px;text-decoration:none;font-family:monospace;">Read Full Post &rarr;</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="padding:16px 32px;border-top:1px solid #1a2235;text-align:center;">
        <span style="color:#2a3650;font-size:11px;font-family:monospace;">farhan.blog // ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Farhan Blog" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `📝 New Blog Published: ${blog.title}`,
      html,
    });
    console.log(`[Email] ✅ Notification sent to ${email}`);
  } catch (err) {
    console.error('[Email] Failed to send notification:', err);
  }
}
