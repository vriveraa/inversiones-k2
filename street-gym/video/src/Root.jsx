import React from 'react';
import { Composition } from 'remotion';
import './fonts';
import { Video } from './Video';
import { DURATION, FPS } from './timeline.mjs';

export function Root() {
  return <Composition id="StreetGym" component={Video} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />;
}
