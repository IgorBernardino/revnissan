(() => {
  const $ = (s) => document.querySelector(s);
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const kmFmt = (km) => km.toLocaleString("pt-BR");

  // ---------- desenhos dos carros (SVG próprio, por tipo) ----------
  const SHAPES = {
    suv:    "M18 62 L22 44 Q26 36 36 34 L62 22 Q70 18 82 18 L132 18 Q144 18 152 26 L166 38 Q182 40 186 48 L188 62 Z",
    sedan:  "M14 62 L16 50 Q20 42 34 40 L60 26 Q68 22 80 22 L120 22 Q132 22 140 30 L154 40 Q182 42 186 52 L188 62 Z",
    hatch:  "M18 62 L20 48 Q24 40 36 38 L60 24 Q68 20 80 20 L136 20 Q148 20 156 30 L166 44 Q180 46 182 54 L182 62 Z",
    pickup: "M12 62 L14 44 Q18 38 30 36 L54 22 Q60 18 70 18 L104 18 Q110 18 112 24 L114 38 L188 38 Q192 38 192 44 L192 62 Z",
    ev:     "M16 62 L18 48 Q22 40 34 38 L58 24 Q68 18 82 18 L128 18 Q142 18 152 28 L166 40 Q182 42 186 50 L188 62 Z",
  };
  function carSVG(m) {
    const light = /^#(e|f)/i.test(m.cor);
    const stroke = light ? "#bdbdbd" : "none";
    return `<svg viewBox="0 0 200 80" role="img" aria-label="${m.nome}">
      <ellipse cx="100" cy="72" rx="88" ry="4" fill="#000" opacity=".12"/>
      <path d="${SHAPES[m.tipo]}" fill="${m.cor}" stroke="${stroke}" stroke-width="1"/>
      <path d="${SHAPES[m.tipo]}" fill="url(#g)" opacity=".35"/>
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <circle cx="50" cy="62" r="11" fill="#1b1b1b"/><circle cx="50" cy="62" r="5" fill="#9a9a9a"/>
      <circle cx="152" cy="62" r="11" fill="#1b1b1b"/><circle cx="152" cy="62" r="5" fill="#9a9a9a"/>
    </svg>`;
  }

  // ---------- WhatsApp ----------
  const wppLink = (msg) => `https://wa.me/${OFICINA.whatsapp}?text=${encodeURIComponent(msg)}`;
  const wppDefault = wppLink(`Olá! Quero agendar uma revisão na ${OFICINA.nome}.`);
  ["#wpp", "#cta-top", "#cta-foot"].forEach((s) => ($(s).href = wppDefault));

  // ---------- estado ----------
  const state = { modelo: null };

  // ---------- passo 1 ----------
  const grid = $("#grid-modelos");
  grid.innerHTML = MODELOS.map(
    (m) => `<button type="button" class="model" role="radio" aria-checked="false" data-id="${m.id}">${carSVG(m)}<span>${m.nome}</span></button>`
  ).join("");
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".model");
    if (btn) selectModel(btn.dataset.id, true);
  });

  const fAno = $("#f-ano"), fMotor = $("#f-motor"), fKm = $("#f-km"), fSubmit = $("#f-submit");
  const opts = (ph, list) => `<option value="">${ph}</option>` + list.map(([v, t]) => `<option value="${v}">${t}</option>`).join("");

  function selectModel(id, scroll) {
    const m = MODELOS.find((x) => x.id === id);
    state.modelo = m;
    grid.querySelectorAll(".model").forEach((b) => b.setAttribute("aria-checked", b.dataset.id === id));
    $("#s2-modelo").textContent = m.nome;
    $("#step2").hidden = false;

    fAno.innerHTML = opts("Selecione o ano modelo", [...m.anos.map((a) => [a, a]), ["?", "Não me lembro"]]);
    fMotor.innerHTML = opts("Selecione a motorização", []);
    fKm.innerHTML = opts("Selecione a quilometragem ou o tempo", []);
    fMotor.disabled = fKm.disabled = fSubmit.disabled = true;
    if (scroll) $("#step2").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  fAno.addEventListener("change", () => {
    const m = state.modelo;
    fMotor.innerHTML = opts("Selecione a motorização", m.motores.map((x) => [x, x]));
    fMotor.disabled = !fAno.value;
    if (m.motores.length === 1 && fAno.value) { fMotor.value = m.motores[0]; fMotor.dispatchEvent(new Event("change")); }
    else { fKm.disabled = true; fSubmit.disabled = true; }
  });
  fMotor.addEventListener("change", () => {
    fKm.innerHTML = opts("Selecione a quilometragem ou o tempo",
      [...ETAPAS.map((e) => [e.km, `${kmFmt(e.km)} km ou ${e.meses} meses`]), ["?", "Não me lembro"]]);
    fKm.disabled = !fMotor.value;
    fSubmit.disabled = true;
  });
  fKm.addEventListener("change", () => (fSubmit.disabled = !fKm.value));

  $("#form-dados").addEventListener("submit", (e) => {
    e.preventDefault();
    const ano = fAno.value === "?" ? "" : fAno.value;
    const km = fKm.value === "?" ? ETAPAS[0].km : fKm.value;
    location.hash = `#/revisao/${state.modelo.id}/${ano || "na"}/${encodeURIComponent(fMotor.value)}/${km}`;
  });

  // ---------- resultado ----------
  function itensSubstituidos(m, idx) {
    const etapa = idx + 1;
    const ev = m.tipo === "ev";
    const diesel = m.motores.some((x) => /diesel/i.test(x));
    return ITENS_SUBSTITUIDOS.filter((i) => etapa % i.cada === 0)
      .filter((i) => !(ev && i.semEV) && !(diesel && i.semDiesel))
      .filter((i) => !(ev && /óleo|bujão|ar do motor/i.test(i.nome)))
      .map((i) => i.nome);
  }

  function renderResult(id, ano, motor, km) {
    const m = MODELOS.find((x) => x.id === id);
    const idx = ETAPAS.findIndex((e) => String(e.km) === String(km));
    if (!m || idx < 0) return showSelect();
    const et = ETAPAS[idx];
    const preco = m.precos[idx];

    $("#r-titulo").textContent = `Revisão de ${et.meses} meses ou ${kmFmt(et.km)} km`;
    $("#r-intro").textContent = `Com base nos dados informados, na revisão de ${kmFmt(et.km)} km do seu ${m.nome} há componentes que precisam ser substituídos e outros que serão inspecionados. Para evitar reparos caros no futuro, este é o pacote que recomendamos agora.`;
    $("#r-subs").innerHTML = itensSubstituidos(m, idx).map((t) => `<li>${t}</li>`).join("");
    $("#r-insp").innerHTML = ITENS_INSPECIONADOS.map((t) => `<li>${t}</li>`).join("");

    $("#r-car").innerHTML = carSVG(m);
    $("#r-nome").textContent = m.nome;
    $("#r-ano").textContent = ano === "na" ? "—" : ano;
    $("#r-motor").textContent = motor;
    $("#r-km").textContent = `${kmFmt(et.km)} km`;
    $("#r-tempo").textContent = `${et.meses} meses`;
    $("#r-preco").textContent = brl(preco);
    $("#r-parc").textContent = `${OFICINA.parcelasMax}x ${(preco / OFICINA.parcelasMax).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
    $("#r-validade").textContent = OFICINA.validadePrecos;
    $("#r-agendar").href = wppLink(
      `Olá! Quero agendar a revisão de ${kmFmt(et.km)} km do meu ${m.nome}${ano !== "na" ? " " + ano : ""} (${motor}). Valor informado no site: ${brl(preco)}.`
    );

    document.title = `Revisão ${kmFmt(et.km)} km · ${m.nome} | ${OFICINA.nome}`;
    $("#view-select").hidden = true;
    $("#view-result").hidden = false;
    window.scrollTo({ top: 0 });
  }

  function showSelect() {
    document.title = `Revisão Periódica | ${OFICINA.nome}`;
    $("#view-result").hidden = true;
    $("#view-select").hidden = false;
    if (state.modelo) selectModel(state.modelo.id, false);
  }

  // ---------- roteamento por hash ----------
  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    if (parts[0] === "revisao" && parts.length === 5) {
      renderResult(parts[1], parts[2], decodeURIComponent(parts[3]), parts[4]);
    } else if (location.hash === "" || location.hash === "#") {
      showSelect();
    }
  }
  document.querySelectorAll("[data-home]").forEach((a) =>
    a.addEventListener("click", (e) => { e.preventDefault(); history.pushState("", "", location.pathname); showSelect(); window.scrollTo({ top: 0, behavior: "smooth" }); })
  );
  window.addEventListener("hashchange", route);

  route();
})();
