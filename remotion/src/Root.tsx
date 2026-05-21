import { Composition } from "remotion";
import { CinematicAd } from "./ads/CinematicAd";
import { KineticAd } from "./ads/KineticAd";
import { PlayfulAd } from "./ads/PlayfulAd";

const W = 1280;
const H = 720;
const FPS = 30;

export const RemotionRoot = () => (
  <>
    <Composition id="ad-cinematic" component={CinematicAd} durationInFrames={240} fps={FPS} width={W} height={H} />
    <Composition id="ad-kinetic" component={KineticAd} durationInFrames={210} fps={FPS} width={W} height={H} />
    <Composition id="ad-playful" component={PlayfulAd} durationInFrames={210} fps={FPS} width={W} height={H} />
  </>
);
