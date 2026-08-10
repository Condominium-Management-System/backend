
import { randomInt } from "crypto";

export const generateCondoCode = () => {
  const number = randomInt(1000, 10000);

  return `HX-${number}`;
};

