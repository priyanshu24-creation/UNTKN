import editorial1 from "@/assets/editorial-1.jpg";
import editorial2 from "@/assets/editorial-2.jpg";
import hero from "@/assets/hero.jpg";
import model1 from "@/assets/model-1.jpg";
import model2 from "@/assets/model-2.jpg";
import story from "@/assets/story.jpg";
import p1 from "@/assets/p1.jpg";
import p4 from "@/assets/p4.jpg";

export const realProductImages = {
  miseryProduct: p1,
  miseryPortrait: hero,
  miserySeated: model1,
  miseryWall: editorial1,
  miseryOverhead: story,
  dragonProduct: p4,
  dragonGraffiti: editorial2,
  dragonStairs: model2,
} as const;

export const realProductGallery = Object.values(realProductImages);