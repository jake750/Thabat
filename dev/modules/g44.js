/* ============ v3.33: one line-icon set instead of emoji in the interface (the owner's pick «أ») ============ */
/* Emoji in buttons, titles, chips and menus are drawn as line icons in the text colour. The emoji itself stays inside the
   icon as <desc>, so textContent (used in comparisons) does not change. User text (tasks, notes, events, Quran) is left alone.
   Faces, sport types and celebration emoji keep their own picture on purpose. */
const UIC_P={
 book:'<path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1v13c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6.5v13"/>',
 folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 folderOpen:'<path d="M3 17V7a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v1"/><path d="M3 17l2.4-6.4A1.5 1.5 0 0 1 6.8 9.5h13.4l-2.6 7.4a1.5 1.5 0 0 1-1.4 1.1H4a1 1 0 0 1-1-1z"/>',
 folders:'<path d="M8 4h3l2 2h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M17 16v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3"/>',
 moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
 mosque:'<path d="M5 20v-8a7 7 0 0 1 14 0v8"/><path d="M3 20h18"/><path d="M12 5V2.5"/><path d="M10 20v-3.5a2 2 0 0 1 4 0V20"/>',
 checkSq:'<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 12l3 3 5-6"/>',
 square:'<rect x="3.5" y="3.5" width="17" height="17" rx="3"/>',
 headphones:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><path d="M4 15a2 2 0 0 1 2-2h1v7H6a2 2 0 0 1-2-2z"/><path d="M20 15a2 2 0 0 0-2-2h-1v7h1a2 2 0 0 0 2-2z"/>',
 film:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5"/>',
 tv:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M8 3l4 3 4-3"/>',
 note:'<path d="M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
 pencil:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
 marker:'<path d="M15 3.5l5.5 5.5-8 8H7v-5.5z"/><path d="M7 17l-3 3.5h5"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 photo:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5-9 9"/>',
 camera:'<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
 stopwatch:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4M12 2v3"/>',
 hourglass:'<path d="M6 3h12M6 21h12"/><path d="M7 3v3a5 5 0 0 0 5 6 5 5 0 0 0 5-6V3"/><path d="M7 21v-3a5 5 0 0 1 5-6 5 5 0 0 1 5 6v3"/>',
 alarm:'<circle cx="12" cy="13" r="7"/><path d="M12 10v3l2 2M5 4L3 6M19 4l2 2"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 warn:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.01"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
 clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM9 11h6M9 15h4"/>',
 books:'<rect x="4" y="4" width="4" height="16" rx="1"/><rect x="10" y="4" width="4" height="16" rx="1"/><path d="M16 5.6l3.3-.9 3 14.6-3.3.9z"/>',
 sprout:'<path d="M12 20v-8"/><path d="M12 12C12 8 9 6 5 6c0 4 3 6 7 6z"/><path d="M12 14c0-3 2.5-5 6-5 0 3-2.5 5-6 5z"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 palette:'<path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
 file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
 repeat:'<path d="M4 11V9a3 3 0 0 1 3-3h13"/><path d="M17 3l3 3-3 3"/><path d="M20 13v2a3 3 0 0 1-3 3H4"/><path d="M7 21l-3-3 3-3"/>',
 phone:'<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
 compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
 chart:'<path d="M4 20h16M7 16v-4M12 16V8M17 16V9"/>',
 trend:'<path d="M4 20h16M4 16l5-5 4 3 7-7"/><path d="M15 7h5v5"/>',
 trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 sparkles:'<path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 sunrise:'<path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 3v5M5 10l1.5 1.5M19 10l-1.5 1.5M9 6l3-3 3 3"/>',
 bolt:'<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
 download:'<path d="M12 3v12M7 10l5 5 5-5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
 hands:'<path d="M12 19c-4 0-7-2.5-7-6.5V8a1.5 1.5 0 0 1 3 0v4"/><path d="M12 19c4 0 7-2.5 7-6.5V8a1.5 1.5 0 0 0-3 0v4"/><path d="M8 12c2 0 4 1.5 4 4M16 12c-2 0-4 1.5-4 4"/>',
 medal:'<circle cx="12" cy="15" r="5"/><path d="M8.5 11.3L6 3h4l2 4 2-4h4l-2.5 8.3"/>',
 bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
 keyboard:'<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
 music:'<path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>',
 bed:'<path d="M3 18V6M3 14h18v4M21 14v-2.5A3.5 3.5 0 0 0 17.5 8H11v6"/><circle cx="7" cy="10.5" r="1.5"/>',
 drop:'<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/>',
 star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 next:'<path d="M5 5l10 7-10 7z"/><path d="M19 5v14"/>',
 prev:'<path d="M19 5L9 12l10 7z"/><path d="M5 5v14"/>',
 pause:'<path d="M8 5v14M16 5v14"/>',
 play:'<path d="M7 4.5l12 7.5-12 7.5z"/>',
 stop:'<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
 ffwd:'<path d="M3 6l8 6-8 6zM13 6l8 6-8 6z"/>',
 coffee:'<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5l1.8 2.3 2.9-.6.6 2.9 2.4 1.7-1.3 2.7 1.3 2.7-2.4 1.7-.6 2.9-2.9-.6L12 21.5l-1.8-2.3-2.9.6-.6-2.9-2.4-1.7L5.6 12 4.3 9.3l2.4-1.7.6-2.9 2.9.6z"/>',
 speak:'<circle cx="9" cy="8" r="3.5"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M17 6a4 4 0 0 1 0 5M19.5 4a7 7 0 0 1 0 9"/>',
 bookmark:'<path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1z"/>',
 checkCirc:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
 frog:'<path d="M4 13.5a8 6 0 0 0 16 0"/><path d="M4 13.5a3 3 0 1 1 4.6-4.3M20 13.5a3 3 0 1 0-4.6-4.3M8.6 9.2c2-1 4.8-1 6.8 0"/><path d="M9 16c1.5 1 4.5 1 6 0"/><circle cx="7" cy="11.5" r=".6"/><circle cx="17" cy="11.5" r=".6"/>',
 laptop:'<path d="M4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v9H4z"/><path d="M2 18h20"/>',
 monitor:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
 pin:'<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
 leaf:'<path d="M5 19C5 11 10 5 20 5c0 10-6 15-14 15"/><path d="M5 19c3-4 6-6 9-7"/>',
 cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v5"/>',
 eyeOff:'<path d="M3 3l18 18"/><path d="M10.6 6.1A10 10 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-3 3.5M6.6 6.6C4.2 8.1 3 12 3 12s4 6 9 6c1.6 0 3-.4 4.3-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 flame:'<path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-3-2 2-3 4-3 7a6 6 0 0 0 6 6z"/>',
 flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
 undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
 dumbbell:'<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
 toolbox:'<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V5h8v3M3 13h18M10 13v2h4v-2"/>',
 expand:'<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
 broom:'<path d="M20 4l-7.5 7.5M9 10l5 5"/><path d="M9 10c-3 0-5 2-6 8l3 3c6-1 8-3 8-6"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3 6"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 money:'<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2A2.5 2 0 0 0 12 7.5c-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1 2-2.5 2a2.5 2 0 0 1-2.5-1.7M12 6v1.5M12 16.5V18"/>',
 box:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
 window:'<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M12 4v16M4 12h16"/>',
 wifi:'<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5v.01"/>',
 tomato:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 6V3M9 5.5l3 1.5 3-1.5"/>',
 puzzle:'<path d="M10 4a2 2 0 0 1 4 0v2h4v4h-2a2 2 0 0 0 0 4h2v4h-4v-2a2 2 0 0 0-4 0v2H6v-4h2a2 2 0 0 0 0-4H6V6h4z"/>',
 brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
 kaaba:'<path d="M4 7l8-3 8 3v10l-8 3-8-3z"/><path d="M4 7l8 3 8-3M12 10v10M4 10.5l8 3 8-3"/>',
 tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
 shuffle:'<path d="M4 6h3l10 12h3M4 18h3l3-3.5M14 9.5L17 6h3M18 4l2 2-2 2M18 16l2 2-2 2"/>',
 clip:'<path d="M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7"/>',
 fullmoon:'<circle cx="12" cy="12" r="8"/>',
 home:'<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
 bell:'<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
 speaker:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
 speakerLow:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
 mute:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
 pulse:'<path d="M3 12h4l2-4 3 8 2-4h7"/>',
 ban:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
 save:'<path d="M5 3h11l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 1-2z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
 pushpin:'<path d="M9 4h6l-1 5 3 3H7l3-3z"/><path d="M12 12v9"/>',
 cloud:'<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/>',
 map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
 question:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17v.01"/>',
 antenna:'<path d="M12 12v9M8.5 8.5a5 5 0 0 1 7 0M5.5 5.5a9 9 0 0 1 13 0"/><circle cx="12" cy="11" r="1"/>',
 bricks:'<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 9.7v4.6M9 14.3V19"/>',
 wind:'<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
 meal:'<path d="M7 3v18M5 3v4a2 2 0 0 0 4 0V3M17 3c-2 2-2 6 0 8v10"/>',
 briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12h18"/>',
 scissors:'<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 18M8 15.5L20 6"/>',
 text:'<path d="M4 7V5h16v2M12 5v14M9 19h6"/>',
 inbox:'<path d="M4 13l2.5-7h11l2.5 7v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 13h5l1 2h4l1-2h5"/>',
 rocket:'<path d="M12 15l-3-3c1-5 5-8 11-9-1 6-4 10-9 11z"/><path d="M9 12H5l2-4h5M12 15v4l4-2v-5"/>',
};
/* emoji (without the variation selector) → icon name */
const UIC_E={'📖':'book','📁':'folder','📂':'folderOpen','🗂':'folders','🌙':'moon','☾':'moon','🕌':'mosque','☑':'checkSq','☐':'square','🎧':'headphones','🎬':'film','🎞':'film','📺':'tv','📝':'note','✎':'pencil','✏':'pencil','✍':'pencil','✒':'pencil','🖍':'marker','📅':'calendar','🗓':'calendar','📆':'calendar','🎯':'target','🖼':'photo','📸':'camera','⏱':'stopwatch','⏳':'hourglass','⏰':'alarm','🕒':'clock','🕰':'clock','⚠':'warn','🔍':'search','📋':'clipboard','📚':'books','🌱':'sprout','🔗':'link','✉':'mail','🎨':'palette','📄':'file','📑':'file','🧾':'file','📒':'file','🗒':'file','🔁':'repeat','🔄':'repeat','♻':'repeat','📱':'phone','📿':'misbaha','🧭':'compass','📊':'chart','📈':'trend','🗑':'trash','✨':'sparkles','☀':'sun','🌅':'sunrise','⚡':'bolt','🔒':'lock','🔓':'unlock','📥':'download','⬇':'download','🤲':'hands','🏅':'medal','🏆':'medal','💡':'bulb','⌨':'keyboard','🎶':'music','🎵':'music','🎙':'mic','🛏':'bed','💧':'drop','⭐':'star','⏭':'next','⏮':'prev','⏸':'pause','⏯':'play','⏹':'stop','⏩':'ffwd','☕':'coffee','⚙':'gear','🗣':'speak','🔖':'bookmark','✅':'checkCirc','🐸':'frog','💻':'laptop','🖥':'monitor','📍':'pin','🍃':'leaf','🌿':'leaf','🎓':'cap','🙈':'eyeOff','👁':'eye','👀':'eye','🔥':'flame','🏁':'flag','⚑':'flag','↩':'undo','💪':'dumbbell','🏋':'dumbbell','🧰':'toolbox','⛶':'expand','🧹':'broom','👥':'users','👤':'user','💰':'money','📦':'box','🪟':'window','📶':'wifi','🍅':'tomato','🧩':'puzzle','🧠':'brain','🕋':'kaaba','🏷':'tag','🔀':'shuffle','📎':'clip','🌕':'fullmoon','🏠':'home','🏡':'home','🔔':'bell','🔊':'speaker','🔈':'speakerLow','🔇':'mute','🩺':'pulse','🚫':'ban','🛑':'ban','🌐':'globe','🌍':'globe','💾':'save','📌':'pushpin','☁':'cloud','🗺':'map','❓':'question','📡':'antenna','🧱':'bricks','🌬':'wind','🍽':'meal','💼':'briefcase','✂':'scissors','🔤':'text','📨':'inbox','🚀':'rocket'};
const UIC_RE=new RegExp('('+Object.keys(UIC_E).map(e=>e.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\uFE0F?','gu');
const UIC_TEST=new RegExp(UIC_RE.source,'u');
/* places whose text belongs to the user or to the Quran: never touched */
const UIC_SKIP='[contenteditable="true"],input,textarea,select,option,script,style,svg,canvas,.tx,.nbody,.ntext,.mp,.qtxt,.aytx,.cevt,.noico,[data-noico],#qText,.qline,.note .body,.wb,.bel,.lbt,.qtx,.ayt';
function uicSvg(name,emo){if(name==='misbaha')return ICON_MISBAHA.replace('<svg','<svg class="uic" aria-hidden="true"').replace('</svg>',`<desc>${emo}</desc></svg>`);
  return`<svg class="uic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${UIC_P[name]}<desc>${emo}</desc></svg>`}
const UIC_TPL={};
function uicNode(name,emo){const k=name+'|'+emo;if(!UIC_TPL[k]){const t0=document.createElement('template');t0.innerHTML=uicSvg(name,emo);UIC_TPL[k]=t0.content.firstChild}return UIC_TPL[k].cloneNode(true)}
function uicText(tn){const s=tn.data;if(!UIC_TEST.test(s))return;const p=tn.parentElement;if(!p||p.closest(UIC_SKIP))return;
  UIC_RE.lastIndex=0;const frag=document.createDocumentFragment();let last=0,m;
  while((m=UIC_RE.exec(s))){if(m.index>last)frag.append(s.slice(last,m.index));frag.append(uicNode(UIC_E[m[1]],m[0]));last=m.index+m[0].length}
  if(last<s.length)frag.append(s.slice(last));tn.replaceWith(frag)}
function uicPass(root){if(!root||document.documentElement.classList.contains('emoji'))return;
  if(root.nodeType===3){uicText(root);return}if(root.nodeType!==1||root.closest&&root.closest(UIC_SKIP))return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>UIC_TEST.test(n.data)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});const L_=[];let n;while((n=w.nextNode()))L_.push(n);L_.forEach(uicText);
  /* placeholders cannot hold an icon: the leading emoji is dropped */
  const ph=root.matches&&root.matches('[placeholder]')?[root]:[];ph.push(...root.querySelectorAll('input[placeholder],textarea[placeholder]'));ph.forEach(i=>{const v=i.placeholder;if(!UIC_TEST.test(v))return;const nv=v.replace(UIC_RE,'').replace(/^\s+/,'');if(nv!==v)i.placeholder=nv})}
const UIC_MO=new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')uicPass(m.target);else m.addedNodes.forEach(uicPass)}});
function uicStart(){if(S.settings.emojiUi){document.documentElement.classList.add('emoji');UIC_MO.disconnect();return}document.documentElement.classList.remove('emoji');uicPass(document.body);UIC_MO.observe(document.body,{childList:true,subtree:true,characterData:true})}
uicStart();
