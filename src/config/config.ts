import { option } from "fp-ts";
import MutableWrapper from "../utils/MutableWrapper";

export const targetYear: MutableWrapper<Number|undefined> = new MutableWrapper(undefined);
export const targetSemester: MutableWrapper<Number|undefined> = new MutableWrapper(undefined);