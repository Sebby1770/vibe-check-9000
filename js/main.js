import { neighborhoodWaypoint } from './neighborhood-navigation.js';
import { createNeighborhoodUI } from './neighborhood-ui.js';
import { LOCAL_VENUES, ROUTE_STOPS, visitNeighborhood, buyLocal, startRoute, completeRouteStop, recordArcade } from './neighborhood.js';
import { EAST_COUNTERS } from './district-layout.js';
import { createLifeUI } from './life-ui.js';
import { credit, startShift, submitShift, buyHome, buyFurnishing, updateLife, money, JOBS } from './life.js';
import { LIFE_PROPS } from './life-world.js';
import { createExpansionUI } from "./expansion-ui.js";
import { finishCounter, followSignal, takeSnack, finishDuet, addPhoto, removePhoto, SIGNAL_SET, STREET_PLACES } from "./expansion.js";
import { STREET_PROPS } from "./street-life.js";
import { framePhoto, drawPhotoPostcard } from "./postcards.js";
import { downloadCard } from "./share.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { Vector3, Quaternion } from "three";
import { createWorld } from "./world.js";
import { createAudio } from "./audio.js";
import { createControls } from "./controls.js";
import { createHud } from "./hud.js";
import { onDanceFloor, applyChoice, NPCS, PROPS, SIT_SPOTS } from "./people.js";
import { getZone, zoneLabel } from "./zones.js";
import { createClock, dayKey, dayHash, tonightBill, PHASE_COPY, dareComplete } from "./night.js";
import { loadProgress, saveProgress, evaluateUnlocks, stampNight, setLook, getLook, touchVisit, buildRecap } from "./progress.js";

import { SHOPS_CATALOG, normalizeCommerce, transact, deliver, collectIce, addLead, getErrands, DESTINATIONS } from "./commerce.js";
import { createShopUI } from "./shop-ui.js";
import { selectInteraction } from "./interactions.js";
import { hitByCar } from "./traffic.js";
import {
    mergeAdConfig,
    POSTER_KIOSK,
    classifieds,
    tonightSponsor,
    checkoutUrl,
    tillUrl,
    stripeLive,
    pitchCopy,
    recordView,
    boardsRead,
    boardProps,
    pricedRates,
    filledSlots,
} from "./ads.js";

const _dir = new Vector3();

function hasWebGL() {
    try {
        const c = document.createElement("canvas");
        return !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
        return false;
    }
}

function isTouch() {
    return window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
}

function bindMobile(controls, hud) {
    const root = document.getElementById("mobile-controls");
    const stick = document.getElementById("stick");
    const knob = document.getElementById("stick-knob");
    if (!isTouch()) return;
    root.classList.remove("hidden");
    hud.toast("TAP LOOK + ON-SCREEN STICK", "#00fff7");

    let sid = null;
    stick.addEventListener("pointerdown", (e) => {
        sid = e.pointerId;
        stick.setPointerCapture(sid);
        moveStick(e);
    });
    stick.addEventListener("pointermove", (e) => {
        if (e.pointerId === sid) moveStick(e);
    });
    const end = (e) => {
        if (e.pointerId !== sid) return;
        sid = null;
        knob.style.transform = "translate(-50%, -50%)";
        controls.setStick(0, 0);
    };
    stick.addEventListener("pointerup", end);
    stick.addEventListener("pointercancel", end);

    function moveStick(e) {
        const r = stick.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let x = (e.clientX - cx) / (r.width / 2);
        let y = (e.clientY - cy) / (r.height / 2);
        const m = Math.hypot(x, y);
        if (m > 1) { x /= m; y /= m; }
        knob.style.transform = `translate(calc(-50% + ${x * 28}px), calc(-50% + ${y * 28}px))`;
        controls.setStick(x, y);
    }

    let lookId = null;
    let last = null;
    const lookPad = document.getElementById("look-pad");
    lookPad.addEventListener("pointerdown", (e) => {
        lookId = e.pointerId;
        last = { x: e.clientX, y: e.clientY };
        lookPad.setPointerCapture(lookId);
    });
    lookPad.addEventListener("pointermove", (e) => {
        if (e.pointerId !== lookId || !last) return;
        controls.lookDelta(e.clientX - last.x, e.clientY - last.y);
        last = { x: e.clientX, y: e.clientY };
    });
    lookPad.addEventListener("pointerup", () => { lookId = null; });
}

async function boot() {
    const canvas = document.getElementById("gl");
    const audio = createAudio();
    let world = null;
    let controls = null;
    let shopUI = null;
    let activityUI = null;
    let lifeUI = null;
    let neighborhoodUI = null, neighborhoodVenue = null;
    let pendingPhoto = false;
    let previewTimer = null;
    let destination = null;
    let savedAt = 0;
    const cubeFound = { done: false };
    let energy = 0;
    let ride = null;
    const clock = createClock();
    const today = dayKey();
    const bill = tonightBill(dayHash(today));
    let progress = touchVisit(loadProgress(), today);
    if (bill.dare) progress = { ...progress, dareId: bill.dare.id };
    saveProgress(progress);
    let commerce = normalizeCommerce(progress.night.commerce);
    cubeFound.done = !!progress.night.flags.cube;
    clock.tick(Math.max(0, Number(progress.night.elapsed) || 0));
    let activeSet = commerce.expansion.signalOn ? SIGNAL_SET : commerce.playingRecord?.set || bill.set;
    if(!commerce.expansion.camera && !commerce.expansion.mystery && !Object.keys(commerce.expansion.workshops).length) destination=STREET_PLACES.find(p=>p.id==="noticeboard");
    if(commerce.neighborhood.active)destination=DESTINATIONS.find(d=>d.id===ROUTE_STOPS[commerce.neighborhood.active.stop]);
    let lastPhase = clock.phase;
    let peaked = false;
    let adConfig = mergeAdConfig();
    let adViews = { viewed: [], counts: {} };
    try {
        const res = await fetch("ads.config.json", { cache: "no-store" });
        if (res.ok) adConfig = mergeAdConfig(await res.json());
    } catch { /* house boards still paint */ }
    let lastZone = "club";
    let recapShown = false;
    let dareToasted = !!progress.dareDone;

    function wear(look) {
        if (!look) look = getLook(progress.look);
        world?.setCuffs(look.left, look.right);
        world?.setVibeColor(look.visor);
        document.documentElement.style.setProperty("--visor", look.visor);
    }

    function note(events = {}) {
        const { progress: next, freshly } = evaluateUnlocks(progress, events);
        const changed = freshly.length
            || next.talked.length !== progress.talked.length
            || next.zones.length !== progress.zones.length
            || next.energyPeak !== progress.energyPeak
            || JSON.stringify(next.flags) !== JSON.stringify(progress.flags)
            || JSON.stringify(next.night) !== JSON.stringify(progress.night)
            || events.force;
        progress = next;
        if (!changed) return;
        const done = dareComplete(progress, bill.dare);
        if (done && !progress.dareDone) {
            progress = { ...progress, dareDone: true };
        }
        saveProgress(progress);
        hud.setProgress({
            unlocked: progress.unlocked,
            look: progress.look,
            flags: progress.night.flags,
            streak: progress.streak,
            dareDone: progress.dareDone,
        });
        if (freshly.length) freshly.forEach((id) => hud.unlockToast(id));
        if (progress.dareDone && !dareToasted) {
            dareToasted = true;
            hud.dareDoneToast();
        }
        hud.setRecap(buildRecap(progress, {
            clock: clock.clock,
            phase: clock.phase,
            set: activeSet.name,
            look: progress.look,
            energy,
            dare: bill.dare?.text,
            dareDone: progress.dareDone,
        }));
    }

    const hud = createHud({
        onEnter: async () => {
            await audio.unlock();
            audio.setMuted(hud.run.muted);
            audio.start();
            if (!isTouch() && controls) controls.lock();
            document.getElementById("mobile-controls").classList.toggle("hidden", !isTouch());
        },
        onOverlay: (open) => {
            if (open) controls?.unlock();
            controls?.setEnabled(!open);
        },
        onResume: () => {
            if (!isTouch()) controls?.lock();
        },
        onUnlockLook: () => controls?.unlock(),
        onMute: (forced) => {
            if (typeof forced === "boolean") {
                audio.setMuted(forced);
                if (!forced && !audio.usingDeck) audio.start();
                return audio.muted;
            }
            const m = audio.toggleMute();
            if (!m && !audio.usingDeck) audio.start();
            return m;
        },
        onSettings: (s) => {
            audio.setReduced(s.reduced);
            audio.setMuted(s.muted);
            controls?.setReduced(s.reduced);
            controls?.setSensitivity(s.sensitivity);
            controls?.setFov(s.fov);
            world?.setFov(s.fov);
            world?.setBloomReduced(s.reduced);
            world?.setCrowdVisible(s.crowd);
            controls?.setTipsy(s.tipsy);
            world?.setTipsy?.(s.tipsy);
            document.documentElement.classList.toggle("reduced-fx", s.reduced);
        },
        onInteract: () => tryInteract(),
        onTalkChoice: (i) => handleChoice(i),
        onFiles: (files) => {
            if (shopUI?.isOpen) { shopUI.close(); stopPreview(); }
            if (activityUI?.isOpen) activityUI.close();
            if (lifeUI?.isOpen) lifeUI.close();
            neighborhoodUI?.close();
            const n = audio.addFiles(files);
            if (n) {
                hud.toast(`${n} TRACK${n > 1 ? "S" : ""} ON THE DECK`, "#00fff7");
                hud.renderTracks(audio.playlist, audio.trackIndex, audio.usingDeck);
                hud.openDeck();
            }
        },
        onDeckPlay: (i) => {
            audio.playTrack(i == null ? Math.max(0, audio.trackIndex) : i);
            hud.renderTracks(audio.playlist, audio.trackIndex, true);
            world?.setLedMessage(audio.trackName, "GUEST AUX");
        },
        onDeckPrev: () => {
            audio.prev();
            hud.renderTracks(audio.playlist, audio.trackIndex, audio.usingDeck);
            world?.setLedMessage(audio.trackName, "GUEST AUX");
        },
        onDeckNext: () => {
            audio.next();
            hud.renderTracks(audio.playlist, audio.trackIndex, audio.usingDeck);
            world?.setLedMessage(audio.trackName, "GUEST AUX");
        },
        onHouse: () => {
            audio.houseSystem();
            audio.setHouseSet(activeSet);
            hud.renderTracks(audio.playlist, audio.trackIndex, false);
            world?.setLedMessage(activeSet.name, "HOUSE SYSTEM");
            hud.toast(`${activeSet.name} BACK ONLINE`, "#39ff14");
        },
        onLook: (look) => {
            progress = setLook(progress, look.id);
            saveProgress(progress);
            wear(look);
        },
        onStamp: () => {
            progress = stampNight(progress, {
                clock: clock.clock,
                phase: clock.phase,
                zone: hud.run.zone,
                energy,
                look: progress.look,
                set: activeSet.name,
                dare: bill.dare?.text,
                dareDone: progress.dareDone,
            });
            saveProgress(progress);
        },
    });

    activityUI = createExpansionUI({
        onClose: shopId => shopId ? openShop(shopId) : resumeStreet(),
        onCounter: (id,picks) => {
            const r=finishCounter(commerce.expansion,id,picks,dayHash(today));
            if(r.ok&&r.reward){commerce.life=credit(commerce.life,20,`${id} · nightly counter thank-you`);r.message+=" A $20 thank-you is in your wallet.";}
            return applyExpansion(r);
        },
        onSnack: id => { const r=takeSnack(commerce.expansion,id);energy=Math.min(100,energy+(r.energy||0));if(r.steady)hud.setTipsy(false);audio.playShopSound();return applyExpansion(r); },
        onDuet: rounds => applyExpansion(finishDuet(commerce.expansion,rounds)),
        onNote: index => {audio.playStreetNote(index);world?.streetLife.pulse(index);},
        onStopNotes: () => world?.streetLife.pulse(-1),
        onCamera: () => {applyExpansion({state:{...commerce.expansion,camera:true},ok:true});return commerce.expansion;},
        onClue: place => applySignal(place),
        onSignalPlay: () => {activeSet=SIGNAL_SET;audio.houseSystem();audio.setHouseSet(activeSet);world.setLedMessage(activeSet.name,"THE CITY ANSWERS");applyExpansion({state:{...commerce.expansion,signalOn:true},ok:true});},
        onNotebook: tab => openJournal(tab),
        onNavigate: id => {destination=DESTINATIONS.find(d=>d.id===id)||null;resumeStreet();},
    });
    neighborhoodUI = createNeighborhoodUI({
        onNote: i=>audio.playStreetNote(i),
        onArcadeScore: rounds=>{if(atWork('arcade'))applyNeighborhood(recordArcade(commerce,rounds));},
        onClose: resumeStreet,
        onBuy: id => {
            if(!atWork(neighborhoodVenue)||!LOCAL_VENUES.find(v=>v.id===neighborhoodVenue)?.items.some(i=>i.id===id))return;
            applyNeighborhood(buyLocal(commerce,id));
        },
        onStartRoute: () => {if(atWork('bakery'))applyNeighborhood(startRoute(commerce),true);},
        onRouteStop: (id,token) => {if(atWork(id)&&id===neighborhoodVenue)applyNeighborhood(completeRouteStop(commerce,id,token),true);},
        onNavigate: id => {destination=DESTINATIONS.find(d=>d.id===id)||null;neighborhoodUI.close();resumeStreet();},
    });
    lifeUI = createLifeUI({
        onClose: resumeStreet,
        onNavigate: id => {destination=DESTINATIONS.find(d=>d.id===id)||null;resumeStreet();hud.toast(destination?`Marked: ${destination.name}`:'Route cleared');},
        onStart: id => atWork(id)?applyLife(startShift(commerce.life,id,dayHash(today))):{state:commerce.life,ok:false,message:'Visit this workplace to clock in.'},
        onSubmit: (picks,token) => atWork(commerce.life.active?.job)?applyLife(submitShift(commerce.life,picks,token)):{state:commerce.life,ok:false,message:'Return to your workplace to finish this order.'},
        onBuyHome: id => applyLife(buyHome(commerce.life,id)),
        onAction: (action,id) => applyLife(updateLife(commerce.life,action,id)),
        onNote: i => audio.playStreetNote(i),
    });
    shopUI = createShopUI({
        onCareer: id => openLife('jobs',{job:id}),
        onLife: page => openLife(page),
        onFurnishing: id => {const r=applyLife(buyFurnishing(commerce.life,id));shopUI.update(commerce);shopUI.showReceipt(null,r.message);},
        onWorkshop: id => openActivity("counter",{shop:id}),
        onExportPhoto: async id => {const photo=commerce.expansion.photos.find(p=>p.id===id);if(photo)try{await downloadCard(await drawPhotoPostcard(photo),"47th-street-postcard.png");}catch{hud.toast("The postcard could not be exported. Try again.");}},
        onDeletePhoto: id => {applyExpansion({state:removePhoto(commerce.expansion,id),ok:true});shopUI.update(commerce);},
        onClose: () => { stopPreview(); hud.setPhase(hud.run.entered ? "explore" : "boot"); if (hud.run.entered && !isTouch()) controls?.lock(); },
        onSelect: (shopId,itemId) => applyPurchase(transact(commerce,shopId,itemId)),
        onPreview: (item) => { stopPreview(); audio.previewRecord(item); previewTimer=setTimeout(()=>{audio.stopPreview();shopUI.stopPreview();},8000); },
        onStopPreview: stopPreview,
        onNavigate: id => { destination=DESTINATIONS.find(d=>d.id===id)||null; hud.toast(destination?`Marked: ${destination.name}`:"Route cleared", "#b5cfad"); },
    });
    hud.wire();
    document.getElementById("lifeBtn").textContent=`LIFE [L] · ${money(commerce.life.wallet)}`;
    document.getElementById("lifeBtn").addEventListener('click',()=>openLife());
    window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='l'&&!e.repeat&&hud.phase==='explore'){e.preventDefault();openLife();}});
    document.getElementById("journalBtn").addEventListener("click",()=>openJournal());
    document.getElementById("pauseJournalBtn").addEventListener("click",()=>openJournal());
    window.addEventListener("keydown",e=>{if(e.key.toLowerCase()==="j"&&!e.repeat&&hud.phase==="explore"){e.preventDefault();openJournal();}});
    hud.setBill(bill);
    hud.setAds?.({
        config: adConfig,
        sponsor: tonightSponsor(adConfig, dayHash(today)),
        rates: pricedRates(adConfig),
        classifieds: classifieds(adConfig),
        checkout: checkoutUrl(adConfig, { id: "boot-pause", name: "Visor inserts", usd: 99 }),
        till: tillUrl(adConfig),
        stripeLive: stripeLive(adConfig),
        pitch: pitchCopy(adConfig),
    });
    hud.run.setName=activeSet.name;
    hud.setProgress({
        unlocked: progress.unlocked,
        look: progress.look,
        flags: progress.night.flags,
        streak: progress.streak,
        dareDone: progress.dareDone,
    });
    hud.setRecap(buildRecap(progress, {
        clock: clock.clock, phase: clock.phase, set: activeSet.name,
        look: progress.look, energy: progress.night.energy, dare: bill.dare?.text, dareDone: progress.dareDone,
    }));
    const scotty = NPCS.find((n) => n.id === "scotty");
    if (scotty && bill.gazette) {
        scotty.nodes.start.say = `MIDTOWN GAZETTE. ${bill.gazette.headline} Five cents, or Harold's copy if you're cheap.`;
        scotty.nodes.head.say = `${bill.gazette.headline} I shouted it first.`;
    }
    audio.setReduced(hud.reducedFx);

    audio.setHouseSet(activeSet);
    audio.setNightPhase(clock.phase);

    if (!hasWebGL()) {
        hud.showFallback();
        return;
    }

    world = createWorld(canvas, adConfig);
    controls = createControls(world.camera, canvas, world.colliders);
    controls.setReduced(hud.reducedFx);
    controls.setEnabled(hud.phase === "explore");
    world.setLedMessage(activeSet.name, "DOORS OPEN");
    world.setNightPhase(clock.phase);
    world.city?.setRivoli?.(bill.gazette.headline);
    wear(getLook(progress.look));
    world.setShopState(commerce);
    hud.run.commerce = commerce;
    hud.run.style = commerce.style;

    if (navigator.xr && navigator.xr.isSessionSupported) {
        navigator.xr.isSessionSupported("immersive-vr").then((ok) => {
            if (!ok) return;
            world.enableXR();
            const vr = VRButton.createButton(world.renderer);
            vr.classList.add("vr-native");
            document.getElementById("vr-slot").appendChild(vr);
        }).catch(() => {});
    }

    bindMobile(controls, hud);

    function applyNeighborhood(result,markRoute=false){
        if(result.ok){commerce=result.state;persistCommerce();audio.playShopSound();}
        if(markRoute&&result.ok){const id=commerce.neighborhood.active?ROUTE_STOPS[commerce.neighborhood.active.stop]:'bakery';destination=DESTINATIONS.find(d=>d.id===id);}
        neighborhoodUI.refresh(commerce,result.message);return result;
    }
    function openNeighborhood(id){
        if(!atWork(id))return;
        shopUI.close();activityUI.close();lifeUI.close();stopPreview();
        neighborhoodVenue=id;const visit=visitNeighborhood(commerce,id);commerce=visit.state;persistCommerce();
        hud.run.talkNpc=null;hud.setPhase('activity');neighborhoodUI.open(id,commerce);neighborhoodUI.refresh(commerce,visit.message);
        audio.playShopSound();
    }
    function atWork(id){return hud.run.entered&&!!id&&getZone(world.camera.position.x,world.camera.position.z,controls.floorY)===id;}
    function applyLife(result){
        if(result.ok){commerce={...commerce,life:result.state};persistCommerce();audio.playShopSound();}
        return result;
    }
    function openLife(page='wallet',context={}){
        neighborhoodUI?.close();shopUI?.close();activityUI?.close();stopPreview();hud.run.talkNpc=null;hud.setPhase('activity');
        const zone=getZone(world.camera.position.x,world.camera.position.z,controls.floorY);
        lifeUI.open(commerce.life,page,{job:hud.run.entered&&JOBS.some(j=>j.id===zone)?zone:undefined,...context});
    }
    function resumeStreet(){hud.setPhase(hud.run.entered?"explore":"boot");if(hud.run.entered&&!isTouch())controls?.lock();}
    function applyExpansion(result){
        if(result.state){commerce={...commerce,expansion:result.state};persistCommerce();note(result.events||{});}
        return result;
    }
    function applySignal(place){
        const result=followSignal(commerce.expansion,place);
        if(result.ok && result.state.signalOn){activeSet=SIGNAL_SET;audio.houseSystem();audio.setHouseSet(activeSet);world.setLedMessage(activeSet.name,"THE CITY ANSWERS");world.flashFloor();}
        applyExpansion(result);return result;
    }
    function openActivity(type,context={}){
        neighborhoodUI?.close();lifeUI?.close();shopUI.close();stopPreview();hud.run.talkNpc=null;hud.setPhase("activity");
        activityUI.open(type,commerce.expansion,{seed:dayHash(today),...context});
    }
    function openStreet(place){
        if(["payphone","signal-sleeve","lostproperty"].includes(place)){const result=applySignal(place);openActivity("signal",{story:result});}
        else openActivity(place);
    }
    function requestPhoto(){
        if(hud.phase!=="explore")return;
        if(!commerce.expansion.camera){destination=DESTINATIONS.find(p=>p.id==="camera");hud.toast("Borrow a camera at the 47th Camera Club. The way is marked.");return;}
        pendingPhoto=true;
    }
    document.getElementById("cameraCapture").addEventListener("click",requestPhoto);
    window.addEventListener("keydown",e=>{if(e.key.toLowerCase()==="c"&&!e.repeat&&hud.phase==="explore"){e.preventDefault();requestPhoto();}});

    function stopPreview() { clearTimeout(previewTimer); audio.stopPreview(); }
    function persistCommerce() {
        document.getElementById("lifeBtn").textContent=`LIFE [L] · ${money(commerce.life.wallet)}`;
        progress={...progress,night:{...progress.night,commerce,elapsed:clock.elapsedReal}};
        hud.run.commerce=commerce;
        hud.run.style=commerce.style;
        hud.run.setName=activeSet.name;
        world?.setShopState(commerce);
        note({force:true});
    }
    function openJournal(section="pockets") {
        if(section==="life"){openLife();return;}
        neighborhoodUI?.close();
        lifeUI?.close();
        activityUI?.close();
        stopPreview(); hud.run.talkNpc=null; hud.setPhase("journal");
        shopUI.openJournal(commerce,getErrands(commerce),hud.run.zone,section);
    }
    function openShop(id) {
        neighborhoodUI?.close();
        lifeUI?.close();
        const shop=SHOPS_CATALOG.find(s=>s.id===id); if(!shop)return;
        stopPreview(); hud.run.talkNpc=null; hud.setPhase("shop");
        shopUI.openShop(shop,commerce,{clock:clock.clock,featuredIndex:dayHash(today)%3});
        audio.playShopSound();
    }
    function finishShopping() { shopUI.close();stopPreview();hud.setPhase("explore");if(!isTouch())controls.lock(); }
    function applyPurchase(result) {
        if(!result.ok){ shopUI.showReceipt(result.item,result.message);hud.toast(result.message,"#d7bd93");return; }
        commerce=result.state; persistCommerce(); note(result.events||{});
        if(result.reward) energy=Math.min(100,energy+(result.item?.energy||0));
        if(result.item?.steady)hud.setTipsy(false);
        audio.playShopSound(result.effect); world.showPurchase(result);
        shopUI.update(commerce);shopUI.showReceipt(result.item,result.message);
        if(["haircut","ticket","coffee","pie"].includes(result.effect)) {
            finishShopping();
            const id=result.effect==="haircut"?"barber-chair":result.effect==="ticket"?"rivoli-bench":"diner-counter";
            const seat=SIT_SPOTS.find(s=>s.id===id); controls.sit(seat);
            if(result.effect==="ticket"){world.city.playFilm(result.item.id);commerce=addLead(commerce,"diner");persistCommerce();}
            hud.toast(result.message,result.item.color);
        }
    }
    const shopActions={vinyl:"records",tonic:"pharmacy",rose:"florist",gin:"liquor",haircut:"barber",ticket:"rivoli",coffee:"diner",pie:"diner"};
    function commerceAction(action) {
        if(shopActions[action]){openShop(shopActions[action]);return true;}
        if(action?.startsWith("deliver-")){
            const recipient=action.slice(8), result=deliver(commerce,recipient);
            if(!result.ok){commerce=addLead(commerce,({rexa:"record",velma:"flowers",marco:"gin",frank:"ice"})[recipient]);persistCommerce();}
            else {
                commerce=result.state;
                if(recipient==="rexa") activeSet=result.item.set;
                persistCommerce();note(result.events);world.showPurchase(result);audio.playShopSound();
                if(recipient==="rexa") { activeSet=result.item.set;audio.houseSystem();audio.setHouseSet(activeSet);world.setLedMessage(activeSet.name,"SID SENT YOU");world.flashFloor();hud.renderTracks(audio.playlist,audio.trackIndex,false); }
                if(recipient==="velma")audio.boostJazz();
            }
            hud.closeTalk();hud.toast(result.message,result.item?.color||"#d6bd91");return true;
        }
        if(action==="lead-ice") {commerce=addLead(commerce,"ice");persistCommerce();hud.closeTalk();hud.toast("Marked in your notebook: Astoria east stairs → 2F → the 4B machine.","#91c8db");return true;}
        if(action==="ice"){
            const result=collectIce(commerce);if(result.ok){commerce=result.state;persistCommerce();note(result.events);world.showPurchase(result);audio.playShopSound();}
            hud.toast(result.message,"#91c8db");return true;
        }
        if(action==="midnight-story") {
            commerce=addLead(commerce,"diner");
            const late=["peak","lastcall","close"].includes(clock.phase);
            if(late&&!commerce.completed.includes("midnight-story")) {commerce.completed.push("midnight-story");commerce.log.push("Dottie saved the booth. Even the city needs somewhere to sit.");note({flags:{midnightStory:true}});}
            persistCommerce();hud.closeTalk();
            const npc={id:"dottie-story",name:"DOTTIE",role:late?"THE MIDNIGHT BOOTH":"A TABLE FOR LATER",nodes:{start:{say:late?"The woman in the picture? She sat right there. Ordered two coffees. Waited for someone wearing your visor. Left before the second one went cold. I kept the booth. Sit. Your pie's warmer than the plot.":"After midnight, sweetheart. The booth keeps better hours than the cinema. Come back when the club drops the heavy one.",choices:[{text:late?"I'll take the booth.":"I'll be back.",next:null,action:late?"story-seat":null}]}}};hud.openTalk(npc);return true;
        }
        if(action==="story-seat"){hud.closeTalk();controls.sit(SIT_SPOTS.find(s=>s.id==="diner-booth"));return true;}
        return false;
    }
    const candidates=[
        ...EAST_COUNTERS.map(p=>({...p,type:"neighborhood",aimY:1.45,reach:2.8,prompt:`[E] ${p.name.toUpperCase()}`})),
        ...LIFE_PROPS,
        POSTER_KIOSK,
        ...boardProps(adConfig),
        ...STREET_PROPS,
        ...NPCS.map(n=>({...n,type:"npc",ref:n,aimY:n.kind==="cat"?.4:1.5,reach:3.1,prompt:`[E] TALK TO ${n.name}`})),
        ...PROPS.map(p=>({...p,type:"prop",aimY:1.05,reach:p.r||2.4})),
        ...[...SIT_SPOTS,...world.district.seats].map(s=>({...s,type:"seat",ref:s,aimY:.62,reach:2.15})),
        {id:"cube",type:"cube",x:world.cube.position.x,z:world.cube.position.z,y:0,aimY:.5,reach:1.8,prompt:"[E] TOUCH THE CUBE"},
    ];
    function interactionTarget() {
        world.camera.getWorldDirection(_dir);
        return selectInteraction({position:world.camera.position,forward:_dir,floorY:controls.floorY,
            candidates:cubeFound.done?candidates.filter(c=>c.type!=="cube"):candidates,boxes:world.colliders.boxes,touch:isTouch()});
    }
    document.getElementById("mobileInteract").addEventListener("click",tryInteract);
    const danceButton=document.getElementById("mobileDance");
    danceButton.addEventListener("pointerdown",e=>{danceButton.setPointerCapture(e.pointerId);controls.setDance(true);});
    for(const event of ["pointerup","pointercancel","lostpointercapture"])danceButton.addEventListener(event,()=>controls.setDance(false));

    function startRide() {
        if (ride) return;
        const startX = world.camera.position.x;
        ride = { t: 0, startX, endX: startX > 0 ? -28 : 8 };
        controls.setRiding(true);
        controls.unlock();
        hud.setRide(true);
        audio.horn();
        hud.toast("CHECKER CAB — hold on to your visor", "#f5c518");
    }

    function handleAction(action) {
        if (!action) return;
        if(action.startsWith("life-")){openLife(action.slice(5),action==="life-club"?{job:"club"}:{});return;}
        if(action.startsWith("street-")){openStreet(action.slice(7));return;}
        if(action==="rent-board"){hud.openAds?.();return;}
        if(action.startsWith("ad-open:")){
            const url=action.slice(8);
            if(url) window.open(url,"_blank","noopener,noreferrer");
            return;
        }
        if (commerceAction(action)) return;
        if (action === "drop") {
            world.flashFloor();
            world.shiftLasers();
            audio.cheer();
            energy = Math.min(100, energy + 18);
        } else if (action === "drink-cyan") {
            world.setVibeColor("#00fff7");
            hud.toast("NEON SOUR — visor goes cyan", "#00fff7");
        } else if (action === "drink-mag") {
            world.setVibeColor("#ff00ff");
            hud.toast("MAGENTA STATIC", "#ff00ff");
        } else if (action === "tipsy") {
            hud.setTipsy(true);
            hud.toast("DRUNK — the room has a second opinion", "#ffb703");
            note({ flags: { drunk: true } });
        } else if (action === "drink-lime") {
            world.setVibeColor("#39ff14");
            hud.toast("MYSTERIOUS WATER", "#39ff14");
        } else if (action === "dance") {
            hud.toast("HOLD SPACE ON THE TILES", "#39ff14");
        } else if (action === "open-deck") {
            hud.openDeck();
        } else if (action === "jazz") {
            audio.boostJazz();
            hud.toast("VELMA TAKES THE BRIDGE", "#e0b25a");
            note({ flags: { jazz: true } });
        } else if (action === "juke") {
            audio.boostJazz();
            hud.toast("JUKEBOX — a nickel well spent", "#e0b25a");
            note({ flags: { jazz: true } });
        } else if (action === "paper") {
            hud.openPaper();
            note({ flags: { paper: true } });
        } else if (action === "phone") {
            openStreet("payphone");
        } else if (action === "hail-cab") {
            startRide();
            note({ flags: { cab: true } });
        } else if (action === "guest") {
            hud.toast("NOVA WROTE YOU IN — don't make her regret the handwriting", "#c77dff");
            note({ flags: { guest: true } });
        } else if (action === "booth") {
            hud.stampCard();
            note({ flags: { booth: true } });
        } else if (action === "coat") {
            hud.toast("The coat check is a rumor. Your jacket is a theory.", "#e0b25a");
        } else if (action === "subway") {
            controls.place(-22.4, 27.15, -22.4, 29.4);
            hud.toast("DOWNTOWN — hold the rail", "#39ff14");
            note({ flags: { subway: true } });
        } else if (action === "token") {
            hud.toast("TOKEN ACCEPTED — the tunnel keeps its hours", "#39ff14");
            note({ flags: { token: true } });
        } else if (action && action.startsWith("enter-")) {
            const dest = {
                "enter-records": [-33.2, 33.5, 37.2],
                "enter-pharmacy": [-21.8, 33.5, 37.2],
                "enter-florist": [-12.2, 33.5, 37.1],
                "enter-rivoli": [6.0, 33.6, 37.4],
                "enter-liquor": [24.6, 33.5, 37.1],
                "enter-barber": [35.8, 33.5, 36.9],
            }[action];
            if (dest) {
                controls.place(dest[0], dest[1], dest[0], dest[2]);
                hud.toast("YOU'RE IN", "#ffe7a8");
            }
        } else if (action === "pet-cat") {
            hud.toast("SOCKS APPROVES — alley reputation +1", "#d8d0c4");
            if (!progress.night.flags.cat) energy = Math.min(100, energy + 8);
            note({ flags: { cat: true } });

        }
    }

    function handleChoice(i) {
        const npc = hud.talkNpc;
        const result = applyChoice(npc, hud.talkNode, i);
        if (commerceAction(result.action)) return;
        if (result.action === "open-deck") {
            handleAction(result.action);
            return;
        }
        handleAction(result.action);
        if (result.closed) hud.closeTalk();
        else hud.setTalkNode(result.nodeId);
    }

    function tryInteract() {
        if (hud.phase !== "explore") return;
        if (controls.sitting) {
            controls.stand();
            hud.toast("BACK ON YOUR FEET", "#e0b25a");
            return;
        }
        const p = world.camera.position;
        const fy = controls.floorY;
        const target=interactionTarget();
        if(target?.type==="neighborhood"){openNeighborhood(target.id);return;}
        if(target?.type==="npc") {
            const npc=target.ref;
            if(npc.id==="frank"){commerce=addLead(commerce,"ice");persistCommerce();}
            if(npc.id==="velma"){commerce=addLead(commerce,"flowers");persistCommerce();}
            if(npc.id==="marco"){commerce=addLead(commerce,"gin");persistCommerce();}
            hud.openTalk(npc);note({talkId:npc.id});return;
        }
        if(target?.type==="prop"){handleAction(target.action);return;}
        const seat=target?.type==="seat"?{spot:target.ref}:null;
        if (seat) {
            if(seat.spot.id==="barber-chair"){openShop("barber");return;}
            if(seat.spot.id==="rivoli-bench"&&!commerce.film){openShop("rivoli");return;}
            if(seat.spot.id==="listen-booth"){openShop("records");return;}
            controls.sit(seat.spot);
            if ((seat.spot.y || 0) >= 4) {
                hud.toast("THE LOUNGE HAS YOU NOW", "#e0b25a");
                note({ flags: { sat: true } });
            } else if ((seat.spot.id || "").startsWith("diner")) {
                hud.toast("COUNTER'S HONEST. YOU'RE NOT.", "#ff6b6b");
            } else if (seat.spot.id === "hotel-lobby") {
                hud.toast("THE CARPETS WILL GOSSIP", "#d4c4a8");
            } else if (seat.spot.id === "barber-chair") {
                hud.toast("MIDNIGHT IS NOT A HAIRSTYLE", "#ff3355");
            } else if (seat.spot.id === "rivoli-bench") {
                hud.toast("DON'T CLAP ON ONE", "#ffe7a8");
            } else if (seat.spot.id === "suite-bed") {
                hud.toast("BETWEEN GUESTS", "#d4c4a8");
            } else if (seat.spot.id === "subway-bench") {
                hud.toast("SOON. ALWAYS SOON.", "#39ff14");
            } else {
                hud.toast("THE STOOL HAS YOU NOW", "#00fff7");
            }
            return;
        }
        if (target?.type === "cube") {
            cubeFound.done = true;
            hud.toast("FORBIDDEN GEOMETRY — the floor likes you more now", "#fff700");
            world.flashFloor();
            energy = Math.min(100, energy + 25);
            note({ flags: { cube: true }, energyPeak: energy });
        }
    }

    // Local-only inspection API for repeatable scene and browser regression checks.
    if (["127.0.0.1","localhost"].includes(location.hostname) && new URLSearchParams(location.search).has("inspect")) {
        window.__vibeInspect = {
            place(x,z,lookX,lookZ,y=0) {controls.sit({x,z,y,eye:1.7,lookX,lookZ});controls.stand();},
            advance(seconds){clock.tick(seconds);},
            look(x,y,z){world.camera.lookAt(x,y,z);},
            get world(){return world;},
            traffic(){return world.city.traffic.map((c)=>({x:c.position.x,z:c.position.z,dir:c.userData.moving}));},
            airborne(){return !!controls.airborne;},
            actors(){return [...world.city.peds,...world.district.peds,world.streetLife.musician].map(person=>{
                const u=person.userData.umbrella,j=person.userData.joints;
                person.updateWorldMatrix(true,true);
                return {position:person.getWorldPosition(new Vector3()).toArray(),umbrella:!!u,
                    gripError:u?u.getWorldPosition(new Vector3()).distanceTo(j.lHand.getWorldPosition(new Vector3())):null,
                    upright:u?new Vector3(0,1,0).applyQuaternion(u.getWorldQuaternion(new Quaternion())).y:null};
            });},
            snapshot(){return {homes:Object.fromEntries([...world.lifeWorld.doors].map(([id,door])=>[id,{locked:door.visible,furnishings:[...world.lifeWorld.decor.get(id)].filter(([,g])=>g.visible).map(([key])=>key)}])),commerce,progress,phase:hud.phase,night:clock.phase,zone:hud.run.zone,sitting:controls.sitting,airborne:!!controls.airborne,energy,filmVersion:world.city.film.material.map.version,audio:{preview:audio.previewing,muted:audio.muted,usingDeck:audio.usingDeck,bpm:audio.bpm},position:{x:world.camera.position.x,y:world.camera.position.y,z:world.camera.position.z},target:interactionTarget()?.id,set:activeSet,render:world.renderer.info.render,memory:world.renderer.info.memory};},
        };
    }

    canvas.addEventListener("click", () => {
        if (hud.phase === "explore" && !controls.isLocked && !isTouch() && !controls.riding) controls.lock();
        if (hud.phase === "explore") tryInteract();
    });

    let last = performance.now();
    world.renderer.setAnimationLoop((now) => {
        world.renderer.info.reset();
        const t = now * 0.001;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const xr = world.renderer.xr.isPresenting;
        const bass = audio.getBass();
        const mid = audio.getMid();
        if (audio.consumeKick()) {
            hud.flashStrobe();
            world.pulseKick();
        }

        if (ride) {
            ride.t += dt;
            const u = Math.min(1, ride.t / 4.2);
            const ease = u < 0.5 ? 2 * u * u : -1 + (4 - 2 * u) * u;
            const x = ride.startX + (ride.endX - ride.startX) * ease;
            world.camera.position.set(x, 1.35, 21.5);
            world.camera.lookAt(x + (ride.endX - ride.startX) * 0.15, 1.2, 21.5);
            if (u >= 1) {
                const z = 16.2;
                controls.setRiding(false);
                controls.place(ride.endX, z, ride.endX, 10);
                hud.setRide(false);
                hud.toast("END OF THE LINE — 47TH STREET", "#f5c518");
                ride = null;
                if (!isTouch()) controls.lock();
            }
        }

        const move = controls.update(dt, audio.bpm, xr);
        const p = world.camera.position;
        if (!ride && hud.phase === "explore" && !controls.airborne && !controls.sitting) {
            const struck = hitByCar(p, world.city.traffic);
            if (struck && controls.knock(struck)) {
                audio.horn();
                hud.toast("THE CHECKER DOESN'T YIELD", "#f5c518");
            }
        }
        const fy = controls.floorY;
        const onFloor = onDanceFloor(p.x, p.z, fy);
        if (move.dancing && onFloor) energy = Math.min(100, energy + dt * 22);
        else energy = Math.max(0, energy - dt * 7);

        clock.tick(hud.phase === "explore" ? dt : 0);
        const phase = clock.phase;
        if (phase !== lastPhase) {
            lastPhase = phase;
            const copy = PHASE_COPY[phase];
            audio.setNightPhase(phase);
            world.setNightPhase(phase);
            world.setLedMessage(activeSet.name, copy.led);
            hud.toast(copy.toast, phase === "peak" ? "#ff00ff" : "#ffb703");
            if (phase === "peak" && !peaked) {
                peaked = true;
                world.flashFloor();
                world.shiftLasers();
                audio.cheer();
                audio.boostJazz();
            }
            if (phase === "lastcall" || phase === "close") note({ phase, flags: { lastcall: true }, energyPeak: energy });
            if (phase === "close" && !recapShown) {
                recapShown = true;
                note({ phase, flags: { afterhours: true }, energyPeak: energy });
                hud.openRecap();
            }
        }
        if (phase === "peak" && onFloor && !progress.night.flags.peakFloor) {
            note({ flags: { peakFloor: true } });
        }

        const zone = getZone(p.x, p.z, fy);
        audio.setZone(zone);
        hud.setZone(zone, zoneLabel(zone));
        hud.setNight({ clock: clock.clock, phase, copy: PHASE_COPY[phase] });
        if (zone !== lastZone) {
            lastZone = zone;
            if (SHOPS_CATALOG.some(s=>s.id===zone))audio.playShopSound();
            note({ zone, energyPeak: energy });
        } else if (energy > (progress.night.energy || 0) + 4) {
            note({ energyPeak: energy });
        }

        world.camera.getWorldDirection(_dir);
        audio.setListener(p.x, p.y, p.z, _dir.x, _dir.y, _dir.z);
        world.update(dt, t, {
            bass, mid, bpm: audio.bpm, reduced: hud.reducedFx, energy,
            talkId: hud.talkNpc && hud.talkNpc.id,
            clock: clock.clock,
            phase,
            dancing: move.dancing && onFloor,
        });
        if (hud.phase === "explore") {
            const seen = world.city?.ads?.lastSeen || [];
            for (const id of seen) {
                const before = boardsRead(adViews);
                adViews = recordView(adViews, id);
                if (before < 5 && boardsRead(adViews) >= 5) note({ flags: { billboards: true } });
            }
        }
        hud.setTelemetry({
            bpm: audio.bpm,
            track: audio.trackName,
            energy,
            bass,
            clock: clock.clock,
        });

        if (hud.phase === "explore" && !ride) {
            if (controls.sitting) hud.setInteract("[E] STAND UP  ·  WASD TO GET UP", true);
            else {
                const target=interactionTarget();
                if(target)hud.setInteract(target.prompt,true);
                else {
                    const seenId=(world.city?.ads?.lastSeen||[])[0];
                    const seen=seenId&&filledSlots(adConfig).find(s=>s.id===seenId);
                    if(seen) hud.setInteract(seen.creative.kind==="available"?`[LOOK] TO LET · ${seen.creative.brand}`:`[LOOK] ${seen.creative.brand} — ${seen.creative.line}`,true);
                    else if (onFloor) hud.setInteract("SPACE TO DANCE", true);
                    else hud.setInteract("", false);
                }
            }
        }

        if(hud.phase!=="explore")hud.setInteract("",false);
        const marker=document.getElementById("wayfinder");
        marker.hidden=!destination||hud.phase!=="explore";
        if(destination) {
            const guidance=neighborhoodWaypoint(p,destination);
            let target=guidance?.target||destination, hint=guidance?.hint||"";
            if(destination.y>2 && fy<2) {
                target=destination.id==="ice"?{x:37,z:9.5}:{x:14.6,z:9.7};
                hint=destination.id==="ice"?"ASTORIA EAST STAIRS → 2F":"CLUB EAST STAIRS → LOUNGE";
            }
            const dx=target.x-p.x,dz=target.z-p.z,dist=Math.hypot(dx,dz),cross=_dir.x*dz-_dir.z*dx,dot=_dir.x*dx+_dir.z*dz;
            const arrow=dist<2?"●":dot<0?"↶":cross>1?"←":cross< -1?"→":"↑";
            marker.textContent=`${arrow} ${destination.name} · ${Math.round(dist)} m${hint?" · "+hint:""} · J notebook`;
        }
        savedAt+=dt;
        if(savedAt>10&&hud.run.entered){savedAt=0;progress={...progress,night:{...progress.night,elapsed:clock.elapsedReal,commerce}};saveProgress(progress);}
        if (xr) world.renderer.render(world.scene, world.camera);
        else world.composer.render();
        document.getElementById("cameraCapture").hidden = !commerce.expansion.camera || hud.phase!=="explore";
        if(pendingPhoto){
            pendingPhoto=false;
            try {
                const photo={id:String(Date.now()),image:world.captureFrame(framePhoto),title:zoneLabel(zone),clock:clock.clock};
                const result=addPhoto(commerce.expansion,photo,zone);applyExpansion(result);audio.playShopSound("ticket");hud.toast(result.message,"#bdd3b2");
            } catch {hud.toast("That frame didn’t develop. Try another photograph.");}
        }
    });
}

boot();
