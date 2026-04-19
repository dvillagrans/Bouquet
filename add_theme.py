import re

with open("src/components/guest/SplitBillScreen.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Add import for useGuestMenuTheme
text = re.sub(r'import \{ payGuestShare \} from "@/actions/comensal";', 
              r'import { payGuestShare } from "@/actions/comensal";\nimport { useGuestMenuTheme } from "@/hooks/useGuestMenuTheme";', 
              text)

# Add useGuestMenuTheme to the component
setup_old = r'''export function SplitBillScreen({
 tableCode,
 guestName,
 partySize,
 initialBill,
}: SplitBillScreenProps) {
 const \[mode, setMode\] = useState<SplitMode>\("shared"\);'''

setup_new = r'''export function SplitBillScreen({
  tableCode,
  guestName,
  partySize,
  initialBill,
}: SplitBillScreenProps) {
  const { menuTheme } = useGuestMenuTheme();
  const [mode, setMode] = useState<SplitMode>("shared");'''

text = re.sub(setup_old, setup_new, text)

# Wrap the main div with theme
div_old = r'''const canPay =
 myShare > 0 &&
 \(mode !== "shared" \|\| Object\.keys\(sharedItems\)\.length > 0\);

 return \(
 <div className="relative min-h-screen">'''

div_new = r'''  const canPay =
    myShare > 0 &&
    (mode !== "shared" || Object.keys(sharedItems).length > 0);

  return (
    <div data-guest-theme={menuTheme} className="guest-menu-vt-root relative min-h-screen">'''

text = re.sub(div_old, div_new, text)

with open("src/components/guest/SplitBillScreen.tsx", "w", encoding="utf-8") as f:
    f.write(text)
