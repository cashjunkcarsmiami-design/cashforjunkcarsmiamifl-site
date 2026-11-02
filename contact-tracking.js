/* Contact clicks indicate intent, not completed phone calls or conversations. No field values are sent to Analytics. */
(() => {
  if (window.miamiFLContactTracking) return;
  window.miamiFLContactTracking = true;
  const page = location.pathname;
  const pendingKey = 'miamiFLPendingQuote';
  const send = (name, extra = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', name, {
      site_name: 'Cash for Junk Cars Miami FL', source_page: page,
      transport_type: 'beacon', ...extra
    });
  };
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    let url; try { url = new URL(link.href, location.href); } catch { return; }
    const phone = url.protocol === 'tel:';
    const whatsapp = url.hostname === 'wa.me' && url.pathname === '/13054570817';
    if (!phone && !whatsapp) return;
    const placement = link.closest('.mobile-actions') ? 'mobile' : link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : link.closest('.hero') ? 'hero' : 'content';
    send(phone ? 'phone_click' : 'whatsapp_click', {contact_method:phone ? 'phone' : 'whatsapp', contact_placement:placement});
  });
  document.querySelectorAll('form[action="https://cash-4-junk-cars-miami.com/api/contact"]').forEach(form => {
    let started = false;
    form.addEventListener('input', () => { if (!started) { started = true; send('quote_start', {contact_method:'form'}); } });
    form.addEventListener('submit', () => {
      send('quote_submit_attempt', {contact_method:'form'});
      // A submit attempt is not a lead. The existing server redirects here only after accepting the request.
      try { sessionStorage.setItem(pendingKey, JSON.stringify({time:Date.now(),page})); } catch {}
    });
  });
  if (page === '/thank-you' || page === '/thank-you.html') {
    let pending = null;
    try { pending = JSON.parse(sessionStorage.getItem(pendingKey)); sessionStorage.removeItem(pendingKey); } catch {}
    let fromSite = false;
    try { const ref = new URL(document.referrer); fromSite = ['cashforjunkcarsmiamifl.com','www.cashforjunkcarsmiamifl.com','cash-4-junk-cars-miami.com'].includes(ref.hostname); } catch {}
    const age = pending ? Date.now() - pending.time : -1;
    if (fromSite && age >= 0 && age < 5 * 60 * 1000 && typeof pending.page === 'string' && /^\/(?!\/)[A-Za-z0-9/_-]*$/.test(pending.page)) {
      send('generate_lead', {contact_method:'form', source_page:pending.page});
    }
  }
})();
