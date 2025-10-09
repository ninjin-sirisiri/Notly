import { Logo } from "./logo";
import { SaveButton } from "./save-button";
import { SettingButton } from "./setting-button";
import { Streak } from "./streak";

export function Header() {
  return (
    <div className="flex items-center justify-between h-[80px] px-4 py-2 bg-gray-300 sticky">
      <Logo />
      <Streak />
      <div className="flex items-center justify-center gap-2">
        <SaveButton />
        <SettingButton />
      </div>
    </div>
  );
}
