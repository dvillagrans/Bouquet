import re

p = 'C:/Users/dvill/workspace/job/Qalma/qalma-mobile/src/screens/analysis/PreanalysisScreen.tsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()

# First replace the literal layout one that may be malformed now
c = re.sub(
    r'<Reanimated\.View entering=\{FadeInUp\.delay\(300\)\.duration\(500\)\}>.?\s*<Reanimated\.View style=\{\[styles\.ctaButtonWrapper, animatedCTAStyle\]\}>',
    '<Reanimated.View entering={FadeInUp.delay(300).duration(500)}>\n              <Reanimated.View style={[styles.ctaButtonWrapper, animatedCTAStyle]}>',
    c
)

c = re.sub(
    r'            <Reanimated\.View\s+style=\{\[styles\.ctaButtonWrapper, animatedCTAStyle\]\}\s+entering=\{FadeInUp\.delay\(300\)\.duration\(500\)\}\s+>',
    '''            <Reanimated.View entering={FadeInUp.delay(300).duration(500)}>
              <Reanimated.View style={[styles.ctaButtonWrapper, animatedCTAStyle]}>''',
    c
)

c = c.replace(
'''              </TouchableOpacity>
            </Reanimated.View>

            <Reanimated.Text''', 
'''              </TouchableOpacity>
              </Reanimated.View>
            </Reanimated.View>

            <Reanimated.Text''')

c = re.sub(
    r'            <Reanimated\.Text\s+style=\{\[styles\.helperText, \{ color: P\.textSec \}\]\}\s+entering=\{FadeInUp\.delay\(400\)\.duration\(400\)\}\s+>\s+([^<]+)\s+</Reanimated\.Text>',
    r'''            <Reanimated.View entering={FadeInUp.delay(400).duration(400)}>
              <Reanimated.Text style={[styles.helperText, { color: P.textSec }]}>
                \1
              </Reanimated.Text>
            </Reanimated.View>''',
    c
)

c = re.sub(
    r'            <Reanimated\.View\s+entering=\{FadeInUp\.delay\(300\)\.duration\(500\)\}\s+style=\{\[styles\.ritualCTAContainer, animatedCTAStyle\]\}\s+>',
    '''            <Reanimated.View entering={FadeInUp.delay(300).duration(500)}>
              <Reanimated.View style={[styles.ritualCTAContainer, animatedCTAStyle]}>''',
    c
)

c = c.replace(
'''                </Pressable>
            </Reanimated.View>

            {/* Link secundario HERO */}''',
'''                </Pressable>
              </Reanimated.View>
            </Reanimated.View>

            {/* Link secundario HERO */}''')

with open(p, 'w', encoding='utf-8', newline='') as f:
    f.write(c)

