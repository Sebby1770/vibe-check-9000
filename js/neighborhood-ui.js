import { LOCAL_VENUES, ROUTE_STOPS } from './neighborhood.js';

const venues = Array.isArray(LOCAL_VENUES) ? LOCAL_VENUES : Object.values(LOCAL_VENUES);
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const money = value => `$${Math.max(0, Number(value) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const identity = {
  books: { edition: 'THE LATE EDITION', heading: 'Good stories.\nLong nights.', collection: 'From the reading table', note: 'A small independent bookshop with a big affection for the city.', mark: 'B', action: 'Take this book', keepsake: 'A book for your collection' },
  bakery: { edition: 'BAKED FOR THE BLOCK', heading: 'Something warm.\nSomething wonderful.', collection: 'From Rosa’s keepsake shelf', note: 'Butter, good company and one more reason to take the long way home.', mark: 'b', action: 'Collect this keepsake', keepsake: 'A little bakery keepsake' },
  arcade: { edition: 'ONE MORE GOOD NIGHT', heading: 'Small change.\nBig city energy.', collection: 'The prize counter', note: 'Bright cabinets, lucky tokens and a pocketful of neighborhood memories.', mark: '★', action: 'Collect this prize', keepsake: 'A prize to keep' },
};

function itemArtwork(id, index) {
  const n = index % 3;
  if (id === 'books') {
    const colors = ['#dc9b6a', '#a9b49a', '#dfba65'];
    const illustration = [
      '<circle cx="133" cy="86" r="29" fill="#eedfbd"/><path d="M53 186V133H80V173H105V120H128V186H147V140H170V186Z" fill="#314b49"/><path d="M101 204L128 145L120 204" fill="#eedfbd"/>',
      '<path d="M112 187V78M112 147Q60 140 75 108Q120 105 112 147M112 120Q155 122 158 84Q115 81 112 120M112 179Q157 174 156 142Q116 139 112 179" fill="#314b49" stroke="#314b49" stroke-width="4"/><circle cx="108" cy="66" r="16" fill="#e9dcc2"/>',
      '<circle cx="112" cy="128" r="57" fill="#314b49"/><circle cx="112" cy="128" r="37" fill="none" stroke="#dec28c" stroke-width="2"/><circle cx="112" cy="128" r="21" fill="#dc9b6a"/><circle cx="112" cy="128" r="5" fill="#efe4ce"/><path d="M155 55L151 122" stroke="#efe4ce" stroke-width="6"/>',
    ][n];
    return `<svg viewBox="0 0 240 260" aria-hidden="true"><ellipse cx="123" cy="240" rx="85" ry="9" fill="#233c3922"/><g transform="rotate(${n === 1 ? 3 : -3} 120 130)"><path d="M41 26H196V230H41Z" fill="#eee0bb"/><path d="M33 21H192V225H33Z" fill="${colors[n]}"/><path d="M33 21H47V225H33Z" fill="#223b39" opacity=".22"/><path d="M57 40H174M57 207H174" stroke="#314b49" stroke-width="1.5"/>${illustration}<text x="116" y="54" text-anchor="middle" fill="#314b49" font-family="Georgia,serif" font-size="9" letter-spacing="3">47TH EDITIONS</text><text x="116" y="219" text-anchor="middle" fill="#314b49" font-family="monospace" font-size="8" letter-spacing="3">VOL. 0${n + 1}</text></g></svg>`;
  }
  if (id === 'bakery') {
    if(index===0)return itemArtwork('books',1);
    return `<svg viewBox="0 0 240 260" aria-hidden="true"><ellipse cx="120" cy="209" rx="78" ry="14" fill="#653f3222"/><rect x="45" y="76" width="150" height="132" rx="18" fill="#628c9d"/><rect x="39" y="63" width="162" height="34" rx="11" fill="#9fbdc3"/><rect x="61" y="106" width="118" height="76" rx="8" fill="#eddbb3"/><path d="M93 145Q119 114 142 139L158 128L151 147Q133 164 104 156L83 171Z" fill="#507e95"/><circle cx="139" cy="137" r="3" fill="#243e4b"/><text x="120" y="198" text-anchor="middle" fill="#fff1c6" font-size="11" font-family="Georgia">SUNRISE · 47TH</text></svg>`;
  }
  const artwork = [
    '<g transform="rotate(-13 120 130)"><rect x="54" y="46" width="132" height="178" rx="12" fill="#e9ba66"/><path d="M69 63H171V207H69Z" fill="none" stroke="#392c43" stroke-width="2" stroke-dasharray="4 4"/><path d="M54 161H186" stroke="#392c43" stroke-width="2" stroke-dasharray="5 6"/><path d="M120 80L130 107L159 108L136 126L143 153L120 138L97 153L104 126L81 108L110 107Z" fill="#b65468"/><text x="120" y="190" text-anchor="middle" font-family="monospace" font-size="15" letter-spacing="3" fill="#392c43">WINNER</text></g>',
    '<ellipse cx="124" cy="206" rx="75" ry="17" fill="#e9ba6620"/><ellipse cx="124" cy="138" rx="68" ry="72" fill="#976138"/><ellipse cx="116" cy="129" rx="68" ry="72" fill="#e9ba66"/><ellipse cx="116" cy="129" rx="55" ry="59" fill="none" stroke="#a87739" stroke-width="3"/><path d="M116 89L127 115L153 117L133 135L139 163L116 148L92 163L99 135L79 117L105 115Z" fill="#946133"/><text x="116" y="184" text-anchor="middle" font-family="monospace" font-size="9" letter-spacing="3" fill="#77502e">GOOD LUCK</text>',
    '<path d="M67 40H159L177 55V121L193 162V216H61V154L74 112Z" fill="#b95c70"/><path d="M78 56H148L158 111H83Z" fill="#282638"/><path d="M86 64H140L148 101H91Z" fill="#86b7af"/><path d="M101 94V82H110V73H122V82H134V94H126V88H109V94Z" fill="#344453"/><path d="M75 124H165L180 153H64Z" fill="#e9ba66"/><path d="M93 130V140" stroke="#392c43" stroke-width="4"/><circle cx="93" cy="128" r="6" fill="#392c43"/><circle cx="142" cy="140" r="5" fill="#b95c70"/><circle cx="159" cy="140" r="5" fill="#344453"/><path d="M89 169H151V201H89Z" fill="#713e58"/><path d="M108 179H132V188H108Z" fill="#282638"/>',
  ][n];
  return `<svg viewBox="0 0 240 260" aria-hidden="true"><g fill="#e9ba66" opacity=".6"><path d="M28 50H38V60H28ZM199 86H207V94H199ZM33 199H39V205H33ZM194 226H205V237H194Z"/></g>${artwork}</svg>`;
}

export function createNeighborhoodUI(hooks = {}) {
  const root = document.createElement('section');
  root.className = 'neighborhood-overlay';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'neighborhood-title');
  root.innerHTML = '<div class="neighborhood-sheet"><div class="neighborhood-content"></div><div class="neighborhood-feedback" role="status" aria-live="polite" aria-atomic="true"></div></div>';
  document.body.append(root);
  const content = root.querySelector('.neighborhood-content');
  const feedback = root.querySelector('.neighborhood-feedback');
  let venue = null;
  let commerce = {};
  let priorFocus = null;
  let game = null;

  function close() {
    if (root.hidden) return;
    root.hidden = true;game=null;
    document.getElementById('visor').inert=false;
    if (priorFocus?.isConnected) priorFocus.focus({ preventScroll: true });
  }
  function exit() {
    close();
    hooks.onClose?.();
  }
  function routePanel(state) {
    const active = state.active;
    if (!active && venue.id !== 'bakery') return '';
    if (!active) return `<aside class="neighborhood-route"><div><p class="neighborhood-eyebrow">A LITTLE WORK. A GOOD WALK.</p><h2>Take the neighborhood round.</h2><p>Bring the bakery’s parcels to the bookshop, then the arcade. Two friendly stops, <strong>$30 in your pocket</strong>. No timer.</p></div><button data-start-route data-focus="route-start" class="neighborhood-primary">Start delivery round <span>↗</span></button></aside>`;
    const stopIndex = Number(active.stop) || 0;
    const nextId = ROUTE_STOPS[stopIndex];
    const nextVenue = venues.find(item => item.id === nextId);
    if (!nextVenue) return '';
    return `<aside class="neighborhood-route is-active"><div><p class="neighborhood-eyebrow">DELIVERY ROUND · $30 ON COMPLETION</p><h2>${nextId === venue.id ? 'A parcel with their name on it.' : `Next stop: ${escape(nextVenue.name)}.`}</h2><ol class="neighborhood-route-stops" aria-label="Delivery progress">${ROUTE_STOPS.map((id, index) => `<li class="${index < stopIndex ? 'is-done' : index === stopIndex ? 'is-next' : ''}"><span>${index < stopIndex ? '✓' : index + 1}</span>${escape(venues.find(item => item.id === id)?.name || id)}${index === stopIndex ? '<small>NEXT</small>' : ''}</li>`).join('')}</ol><p>Your round stays saved if you leave. Finish both stops to collect your pay.</p></div>${nextId === venue.id ? `<button data-route-stop="${escape(venue.id)}" data-route-token="${escape(`${active.serial}:${active.stop}`)}" data-focus="route-handover" class="neighborhood-primary">Hand over the parcel <span>↗</span></button>` : `<button data-navigate="${escape(nextId)}" data-focus="route-navigate" class="neighborhood-primary">Mark the way <span>↗</span></button>`}</aside>`;
  }
  function passport(state) {
    const visited = state.visited || [];
    const purchases = state.purchases || [];
    const count = venues.filter(item => visited.includes(item.id)).length;
    return `<section class="neighborhood-passport" aria-labelledby="neighborhood-passport-title"><div class="neighborhood-passport-heading"><div><p class="neighborhood-eyebrow">AROUND THE NEIGHBORHOOD</p><h2 id="neighborhood-passport-title">Become a familiar face.</h2><p>${state.bonusClaimed ? 'All three stamps collected. Your $20 welcome gift is in your wallet.' : 'Visit all three counters for a $20 welcome gift. No purchase needed.'}</p></div><strong class="neighborhood-stamp-count">${count}<span>/ 3 STAMPS</span></strong></div><div class="neighborhood-stamps">${venues.map(item => {
      const stamped = visited.includes(item.id);
      const owned = (item.items || []).filter(product => purchases.includes(product.id)).length;
      return `<article class="neighborhood-stamp ${stamped ? 'is-stamped' : ''}"><span class="neighborhood-stamp-icon" aria-hidden="true">${stamped ? '✓' : identity[item.id]?.mark || '◇'}</span><div><h3>${escape(item.name)}</h3><p>${stamped ? 'VISITED' : 'TO DISCOVER'} · ${owned}/${item.items.length} COLLECTED</p></div>${item.id === venue.id ? '<span class="neighborhood-here">YOU’RE HERE</span>' : `<button data-navigate="${escape(item.id)}" data-focus="visit-${escape(item.id)}" aria-label="Mark the way to ${escape(item.name)}">Find it <span>↗</span></button>`}</article>`;
    }).join('')}</div><p class="neighborhood-collection-note">Your purchases are keepsakes. Buy once and keep them across nights.</p></section>`;
  }
  function arcadePanel(state){
    if(venue.id!=='arcade')return '';
    const names=['STAR','MOON','SUN'];
    if(!game)return `<section class="neighborhood-game"><p class="neighborhood-eyebrow">SIGNAL MATCH · FREE TO PLAY</p><h2>Can you remember the lights?</h2><p>Study a sequence, then repeat it with three buttons. Three rounds, no timer. Best: ${state.arcadeBest||0}/3.</p><button data-game-start data-focus="game-start" class="neighborhood-primary">Play Signal Match ↗</button></section>`;
    return `<section class="neighborhood-game"><p class="neighborhood-eyebrow">SIGNAL MATCH · ROUND ${game.round+1} / 3</p><h2>${game.done?'Perfect signal!':game.study?'Study the signal.':'Your turn.'}</h2><p role="status">${game.message||'Remember the order, then press Ready. No time limit.'}</p>${game.done?'<button data-game-start data-focus="game-start">Play again</button>':game.study?`<p class="neighborhood-signal">${game.sequence.map(n=>names[n]).join(' → ')}</p><button data-game-ready data-focus="game-ready" class="neighborhood-primary">Ready — hide the signal</button>`:`<div class="neighborhood-pads">${names.map((name,i)=>`<button data-game-pad="${i}" data-focus="pad-${i}" aria-label="${name}">${['★','☾','☀'][i]}<small>${name}</small></button>`).join('')}</div><p>${game.picks.length} / ${game.sequence.length} notes entered</p><button data-game-repeat data-focus="game-repeat">Show the signal again</button>`}</section>`;
  }
  function newRound(round=0){
    game={round,sequence:Array.from({length:3+round},()=>Math.floor(Math.random()*3)),picks:[],study:true,message:round?'Nice work. Here is your next signal.':''};
  }
  function render() {
    const previousKey = root.contains(document.activeElement) ? document.activeElement.dataset.focus : null;
    const scroll = content.querySelector('.neighborhood-scroll')?.scrollTop || 0;
    const style = identity[venue.id] || identity.books;
    const state = commerce.neighborhood || {};
    const wallet = Number(commerce.life?.wallet) || 0;
    root.dataset.venue = venue.id;
    content.innerHTML = `<header class="neighborhood-mast"><span>EAST DISTRICT <i>·</i> 47TH STREET</span><button data-close data-focus="close" aria-label="Close ${escape(venue.name)} and return to the street">Back to the street <b aria-hidden="true">×</b></button></header><div class="neighborhood-scroll"><div class="neighborhood-shop-heading"><div><p class="neighborhood-eyebrow">${escape(style.edition)} <span>● OPEN LATE</span></p><h1 id="neighborhood-title">${escape(venue.name)}</h1><p>${escape(venue.tag || style.note)}</p></div><div class="neighborhood-wallet"><small>YOUR WALLET</small><strong>${money(wallet)}</strong><span>IN-GAME DOLLARS</span></div></div><section class="neighborhood-intro" aria-label="Welcome"><div class="neighborhood-welcome"><p class="neighborhood-eyebrow">${escape(venue.owner)} IS AT THE COUNTER</p><h2>${style.heading.split('\n').map(escape).join('<br>')}</h2><p>${escape(venue.description || style.note)}</p></div><div class="neighborhood-emblem" aria-hidden="true"><span>${style.mark}</span><small>${venue.id === 'books' ? 'READ THE CITY' : venue.id === 'bakery' ? 'MADE WITH LOVE' : 'PLAY THE NIGHT'}</small></div></section>${routePanel(state)}${arcadePanel(state)}<section class="neighborhood-catalog" aria-labelledby="neighborhood-catalog-title"><div class="neighborhood-section-label"><h2 id="neighborhood-catalog-title">${style.collection}</h2><span>${venue.items.length} HANDPICKED FAVORITES</span></div><div class="neighborhood-products">${venue.items.map((item, index) => {
      const owned = (state.purchases || []).includes(item.id);
      const affordable = wallet >= item.price;
      const action = owned ? 'In your collection ✓' : affordable ? style.action : `Need ${money(item.price - wallet)} more`;
      return `<article class="neighborhood-product ${owned ? 'is-owned' : ''}"><div class="neighborhood-art">${itemArtwork(venue.id, index)}<span class="neighborhood-item-number">Nº 0${index + 1}</span>${owned ? '<span class="neighborhood-owned">COLLECTED ✓</span>' : ''}</div><div class="neighborhood-product-copy"><p class="neighborhood-eyebrow">${style.keepsake}</p><h3>${escape(item.name)}</h3><p class="neighborhood-item-description">${escape(item.description)}</p><div class="neighborhood-price"><strong>${money(item.price)}</strong><span>YOURS TO KEEP</span></div><button data-buy="${escape(item.id)}" data-focus="buy-${escape(item.id)}" class="neighborhood-buy" aria-label="${escape(owned ? `${item.name} is in your collection` : `${action}: ${item.name}, ${money(item.price)}`)}" ${owned || !affordable ? 'disabled' : ''}>${action}${owned || !affordable ? '' : '<span>↗</span>'}</button></div></article>`;
    }).join('')}</div></section>${passport(state)}<footer class="neighborhood-foot"><span>Independent shops. A neighborhood of your own.</span><span>EAST DISTRICT / OPEN LATE</span></footer></div>`;
    content.querySelector('[data-close]').onclick = exit;
    content.querySelector('[data-game-start]')?.addEventListener('click',()=>{newRound();render();content.querySelector('[data-game-ready]').focus();});
    content.querySelector('[data-game-ready]')?.addEventListener('click',()=>{game.study=false;game.message='Repeat the signal in order.';render();content.querySelector('[data-game-pad]').focus();});
    content.querySelector('[data-game-repeat]')?.addEventListener('click',()=>{game.study=true;game.picks=[];game.message='Take another look. There is no penalty.';render();content.querySelector('[data-game-ready]').focus();});
    content.querySelectorAll('[data-game-pad]').forEach(button=>button.onclick=()=>{
      const n=Number(button.dataset.gamePad);
      hooks.onNote?.(n);
      if(n!==game.sequence[game.picks.length]){game.picks=[];game.message='Almost. Try the sequence again, or show it for another look.';render();return;}
      game.picks.push(n);
      if(game.picks.length===game.sequence.length){
        const cleared=game.round+1;
        if(cleared===3){game.done=true;game.message='Three rounds cleared. Your personal best is saved. Play again whenever you like.';}else newRound(cleared);
        hooks.onArcadeScore?.(cleared);
      }
      render();
      if(game.study)content.querySelector('[data-game-ready]')?.focus();
    });
    content.querySelectorAll('[data-buy]').forEach(button => { button.onclick = () => hooks.onBuy?.(button.dataset.buy); });
    content.querySelector('[data-start-route]')?.addEventListener('click', () => hooks.onStartRoute?.());
    content.querySelector('[data-route-stop]')?.addEventListener('click', event => hooks.onRouteStop?.(event.currentTarget.dataset.routeStop, event.currentTarget.dataset.routeToken));
    content.querySelectorAll('[data-navigate]').forEach(button => { button.onclick = () => hooks.onNavigate?.(button.dataset.navigate); });
    content.querySelector('.neighborhood-scroll').scrollTop = scroll;
    if (previousKey) {
      const previous = [...content.querySelectorAll('[data-focus]')].find(element => element.dataset.focus === previousKey && !element.disabled);
      (previous || content.querySelector('[data-close]')).focus({ preventScroll: true });
    }
  }
  root.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); exit(); return; }
    if (event.key !== 'Tab') return;
    const buttons = [...root.querySelectorAll('button:not(:disabled)')];
    const first = buttons[0];
    const last = buttons.at(-1);
    if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
  });
  root.addEventListener('keyup', event => event.stopPropagation());
  return {
    open(id, input) {
      const match = venues.find(item => item.id === id);
      if (!match) return false;
      if (root.hidden) priorFocus = document.activeElement;
      venue = match;
      commerce = input || {};
      feedback.textContent = '';
      render();
      root.hidden = false;
      document.getElementById('visor').inert=true;
      content.querySelector('.neighborhood-scroll').scrollTop = 0;
      content.querySelector('[data-close]').focus({ preventScroll: true });
      return true;
    },
    refresh(input, message) {
      commerce = input || {};
      if (venue && !root.hidden) render();
      if (message !== undefined) feedback.textContent = String(message || '');
    },
    close,
    get isOpen() { return !root.hidden; },
  };
}
