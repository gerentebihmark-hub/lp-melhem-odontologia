document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Cabeçalho: fica sólido depois de sair do hero
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.getElementById('mobile-toggle');

  const floatingWa = document.querySelector('.floating-whatsapp');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    // botão flutuante só depois do hero (o hero já tem o próprio CTA)
    if (floatingWa) {
      const contato = document.getElementById('contato');
      const noContato = contato && contato.getBoundingClientRect().top < window.innerHeight * 0.7;
      floatingWa.classList.toggle('show', window.scrollY > window.innerHeight * 0.8 && !noContato);
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 1b. Hero: entrada do título e paralaxe suave da fachada
  const hero = document.querySelector('.hero');
  if (hero) requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-in')));

  // 2. Menu mobile em tela cheia
  const setMenu = (open) => {
    navbar.classList.toggle('mobile-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', String(open));
      mobileToggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    }
  };
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => setMenu(!navbar.classList.contains('mobile-open')));
    document.querySelectorAll('.mobile-nav-link, .mobile-action-btn').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  // 3. Especialidades: lista indexada + prévia fixa que acompanha o foco
  const specList = document.getElementById('spec-list');
  if (specList) {
    const rows = [...specList.querySelectorAll('.spec-row')];
    const previews = [...document.querySelectorAll('.spec-preview-img')];
    const canHover = window.matchMedia('(hover: hover)').matches;

    const setPreview = (i) => previews.forEach((img, k) => img.classList.toggle('active', k === i));
    const openIndex = () => Math.max(0, rows.findIndex((r) => r.classList.contains('is-open')));

    rows.forEach((row, i) => {
      const head = row.querySelector('.spec-head');

      head.addEventListener('click', () => {
        const wasOpen = row.classList.contains('is-open');
        rows.forEach((r) => {
          r.classList.remove('is-open');
          r.querySelector('.spec-head').setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          row.classList.add('is-open');
          head.setAttribute('aria-expanded', 'true');
        }
        setPreview(i);
      });

      if (canHover) head.addEventListener('mouseenter', () => setPreview(i));
      head.addEventListener('focus', () => setPreview(i));
    });

    specList.addEventListener('mouseleave', () => setPreview(openIndex()));
  }

  // 4. FAQ em acordeão
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', () => {
      const wasActive = item.classList.contains('active');

      faqItems.forEach((other) => {
        other.classList.remove('active');
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!wasActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // 5. Rolagem suave para âncoras internas
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });



  // 7. Formulários: envia direto para o WhatsApp
  const setupForm = (formId, msgId, nomeId, telId, interesseId) => {
    const form = document.getElementById(formId);
    if (!form) return;
    const msg = document.getElementById(msgId);
    const nomeInput = document.getElementById(nomeId);
    const telefoneInput = document.getElementById(telId);
    const interesseSelect = document.getElementById(interesseId);

    [nomeInput, telefoneInput].forEach((input) => {
      if (!input) return;
      input.addEventListener('input', () => {
        input.classList.remove('invalid');
        if (msg) msg.textContent = '';
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = nomeInput ? nomeInput.value.trim() : '';
      const telefone = telefoneInput ? telefoneInput.value.trim() : '';
      const interesse = interesseSelect ? interesseSelect.value : 'Avaliação Geral';

      if (nomeInput) nomeInput.classList.toggle('invalid', !nome);
      if (telefoneInput) telefoneInput.classList.toggle('invalid', !telefone);

      if (!nome || !telefone) {
        if (msg) msg.textContent = 'Por favor, preencha seu nome e seu WhatsApp.';
        if (!nome && nomeInput) nomeInput.focus();
        else if (telefoneInput) telefoneInput.focus();
        return;
      }

      const mensagem = `Olá! Meu nome é ${nome} (${telefone}). Gostaria de agendar uma avaliação na Melhem Odontologia para: ${interesse}.`;
      const url = `https://wa.me/5533997108990?text=${encodeURIComponent(mensagem)}`;

      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    });
  };

  setupForm('hero-contact-form', 'hero-form-msg', 'hero-nome', 'hero-telefone', 'hero-interesse');
  setupForm('contact-form', 'form-msg', 'nome', 'telefone', 'interesse');

  // 8. Animação de entrada ao rolar
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('revealed'));
  }
});
