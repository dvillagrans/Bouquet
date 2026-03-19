const fs = require('fs');

let content = fs.readFileSync('src/components/guest/MenuScreen.tsx', 'utf8');

// Render tracking block at the top of the menu body
let trackingUI = `
            {/* TRACING DE ORDENES ACTIVAS */}
            {orders && orders.length > 0 && (
              <div className="py-8 border-b border-wire mb-4">
                <h3 className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-glow mb-4">Estado de tus órdenes ({orders.length})</h3>
                <div className="flex flex-col gap-3">
                  {orders.map(o => (
                    <div key={o.id} className="border border-wire p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[0.8rem] text-light mb-1">Orden <span className="font-mono text-dim">#{o.id.slice(-4)}</span></p>
                        <ul className="text-[0.65rem] text-dim flex flex-wrap gap-x-2 gap-y-1">
                          {o.items.map((item, idx) => (
                            <li key={idx} className="bg-wire/20 px-1.5 py-0.5 whitespace-nowrap">
                              {item.quantity}x {item.menuItem?.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {o.status === 'PENDING' && <span className="text-[0.6rem] font-bold tracking-widest text-dim border border-wire px-2 py-1">EN ESPERA</span>}
                        {o.status === 'PREPARING' && <span className="text-[0.6rem] font-bold tracking-widest text-glow border border-glow/30 bg-glow/5 px-2 py-1">PREPARANDO</span>}
                        {o.status === 'READY' && <span className="text-[0.6rem] font-bold tracking-widest text-green-400 border border-green-500/30 bg-green-500/5 px-2 py-1">LISTA</span>}
                        {o.status === 'DELIVERED' && <span className="text-[0.6rem] font-bold tracking-widest text-sage-deep border border-sage-deep/30 px-2 py-1">ENTREGADA</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category tabs */}`;

content = content.replace('{/* Category tabs */}', trackingUI);

fs.writeFileSync('src/components/guest/MenuScreen.tsx', content);

