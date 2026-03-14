'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';

// Register all GSAP plugins once — import this file wherever GSAP is used
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase, SplitText);

  // Custom easing curves for cinematic motion
  CustomEase.create('expo.out',   '0.16, 1, 0.3, 1');
  CustomEase.create('expo.in',    '0.95, 0.05, 0.795, 0.035');
  CustomEase.create('back.out',   '0.34, 1.56, 0.64, 1');
  CustomEase.create('cinematic',  '0.25, 0.1, 0.25, 1');
  CustomEase.create('snap',       '0.87, 0, 0.13, 1');
}

export { gsap, ScrollTrigger, ScrollToPlugin, CustomEase, SplitText };
