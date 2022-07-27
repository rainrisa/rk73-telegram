import { Context, Scenes } from "telegraf";

interface MyWizardSession extends Scenes.WizardSessionData {
  vidName: string;
  vidHash: string;
}
export type MyContext = Scenes.WizardContext<MyWizardSession>;

export interface ContextStartPayload extends Context {
  startPayload: string;
}
