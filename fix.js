const fs = require('fs');
const p = 'C:/Users/dvill/workspace/job/Qalma/qalma-mobile/src/screens/analysis/PreanalysisScreen.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/<Reanimated\.View entering=\{FadeInUp\.delay\(300\)\.duration\(500\)\}>..n              <Reanimated\.View style=\{\[styles\.ctaButtonWrapper, animatedCTAStyle\]\}>/, 
\<Reanimated.View entering={FadeInUp.delay(300).duration(500)}>
              <Reanimated.View style={[styles.ctaButtonWrapper, animatedCTAStyle]}>\);

// First instance closing tag:
c = c.replace(
\              </TouchableOpacity>
            </Reanimated.View>

            <Reanimated.Text\,
\              </TouchableOpacity>
              </Reanimated.View>
            </Reanimated.View>

            <Reanimated.Text\);

// Helper text:
c = c.replace(
\            <Reanimated.Text
              style={[styles.helperText, { color: P.textSec }]}
              entering={FadeInUp.delay(400).duration(400)}
            >
              Asegúrate de que tu headband esté encendida
            </Reanimated.Text>\,
\            <Reanimated.View entering={FadeInUp.delay(400).duration(400)}>
              <Reanimated.Text style={[styles.helperText, { color: P.textSec }]}>
                Asegúrate de que tu headband esté encendida
              </Reanimated.Text>
            </Reanimated.View>\);


// Second CTA (ritual):
c = c.replace(
\            <Reanimated.View
              entering={FadeInUp.delay(300).duration(500)}
              style={[styles.ritualCTAContainer, animatedCTAStyle]}
            >\,
\            <Reanimated.View entering={FadeInUp.delay(300).duration(500)}>
              <Reanimated.View style={[styles.ritualCTAContainer, animatedCTAStyle]}>\);

c = c.replace(
\                </Pressable>
            </Reanimated.View>\,
\                </Pressable>
              </Reanimated.View>
            </Reanimated.View>\);

fs.writeFileSync(p, c);
