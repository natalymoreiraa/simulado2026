import { useState, useEffect } from 'react'
import { dadosClima } from './dadosClima'
import { codigosWmo } from './codigosWmo'
import './App.css'

const configPortal = {
  nome: 'Sol Chuva',
  slogan: 'O tempo certo, onde você estiver'
}

function IconeClima({ tipo, tamanho = 44 }) {
  if (tipo === 'sol') {
    return (
      <svg width={tamanho} height={tamanho} viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="14" fill="#F59E0B" />
        <g stroke="#F59E0B" strokeWidth="4" strokeLinecap="round">
          <line x1="32" y1="6" x2="32" y2="12" />
          <line x1="32" y1="52" x2="32" y2="58" />
          <line x1="6" y1="32" x2="12" y2="32" />
          <line x1="52" y1="32" x2="58" y2="32" />
          <line x1="13.6" y1="13.6" x2="17.9" y2="17.9" />
          <line x1="46.1" y1="46.1" x2="50.4" y2="50.4" />
          <line x1="13.6" y1="50.4" x2="17.9" y2="46.1" />
          <line x1="46.1" y1="17.9" x2="50.4" y2="13.6" />
        </g>
      </svg>
    )
  }

  if (tipo === 'nublado') {
    return (
      <svg width={tamanho} height={tamanho} viewBox="0 0 64 64">
        <path d="M46 42H20a10 10 0 0 1-1.5-19.9A13 13 0 0 1 43.5 19a11 11 0 0 1 2.5 23z" fill="#9CA3AF" />
      </svg>
    )
  }

  if (tipo === 'tempestade') {
    return (
      <svg width={tamanho} height={tamanho} viewBox="0 0 64 64">
        <path d="M46 38H20a10 10 0 0 1-1.5-19.9A13 13 0 0 1 43.5 15a11 11 0 0 1 2.5 23z" fill="#7D8590" />
        <polygon points="33,36 25,48 31,48 28,58 39,45 33,45" fill="#F59E0B" />
      </svg>
    )
  }

  // Padrão: chuva / garoa (nuvem cinza com 3 gotas azuis)
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64">
      <path d="M46 38H20a10 10 0 0 1-1.5-19.9A13 13 0 0 1 43.5 15a11 11 0 0 1 2.5 23z" fill="#9CA3AF" />
      <g stroke="#2563EB" strokeWidth="3.2" strokeLinecap="round">
        <line x1="23" y1="44" x2="20" y2="52" />
        <line x1="33" y1="44" x2="30" y2="52" />
        <line x1="43" y1="44" x2="40" y2="52" />
      </g>
    </svg>
  )
}

function App() {
  const [busca, setBusca] = useState('')
  const [cidade, setCidade] = useState(null)
  const [clima, setClima] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    buscar('Brasília')
  }, [])

  async function buscar(nome) {
    const texto = (nome !== undefined ? nome : busca).trim()
    if (!texto) {
      setErro('Digite uma cidade')
      return
    }

    setBusca(texto)
    setCarregando(true)
    setErro('')
    setCidade(null)
    setClima(null)

    try {
      const r1 = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(texto)}&count=1&language=pt`)
      if (!r1.ok) throw new Error()
      const d1 = await r1.json()

      if (!d1.results || d1.results.length === 0) {
        setErro('Localidade não encontrada')
        setCarregando(false)
        return
      }

      const loc = d1.results[0]
      setCidade(loc)

      const r2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=10`)
      if (!r2.ok) throw new Error()
      const d2 = await r2.json()
      setClima(d2)
    } catch {
      setErro('Não foi possível carregar os dados')
    }

    setCarregando(false)
  }

  function pegarInfo(cod) {
    return codigosWmo.find(item => item.codigo === cod) || { descricao: 'Nublado', tipo: 'nublado' }
  }

  function formatarDia(data, i) {
    const [ano, mes, dia] = data.split('-')
    const sem = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const nome = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : sem[new Date(ano, mes - 1, dia).getDay()]
    return { nome, data: `${dia}/${mes}` }
  }

  return (
    <div className="app">
      <header className="primeira">
        <div className="logo-box">
          <svg width="34" height="34" viewBox="0 0 64 64">
            <circle cx="24" cy="24" r="10" fill="#F59E0B" />
            <path d="M48 44H24a9 9 0 0 1-1.3-17.9A11 11 0 0 1 44 23a10 10 0 0 1 4 21z" fill="#3B82F6" />
          </svg>
        </div>
        <div className="coluna">
          <h1>{configPortal.nome}</h1>
          <p>{configPortal.slogan}</p>
        </div>
      </header>

      <div className="busca">
        <input
          list="cidades"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && buscar()}
          placeholder="Digite o nome de uma cidade..."
        />
        <datalist id="cidades">
          {dadosClima.map((c, i) => <option key={i} value={c.name} />)}
        </datalist>
        <button className="btn" onClick={() => buscar()}>Buscar</button>
      </div>

      <div className="chips">
        {dadosClima.map((c, i) => (
          <button key={i} onClick={() => buscar(c.name)}>{c.name}</button>
        ))}
      </div>

      {carregando && <p>Carregando dados do clima...</p>}
      {erro && <p className="erro">{erro}</p>}

      {cidade && clima && !carregando && (
        <section className="atual">
          <div className="atual-topo">
            <div>
              <h2>{cidade.name}</h2>
              <p className="sub-local">{cidade.admin1} — {cidade.country}</p>
            </div>
            <span className="atualizado">
              Atualizado às {clima.current.time ? clima.current.time.slice(11) : ''}
            </span>
          </div>

          <div className="atual-corpo">
            <div className="principal">
              <IconeClima tipo={pegarInfo(clima.current.weather_code).tipo} tamanho={76} />
              <div>
                <h1>{Math.round(clima.current.temperature_2m)}°C</h1>
                <p>{pegarInfo(clima.current.weather_code).descricao}</p>
              </div>
            </div>

            <div className="grade-info">
              <div className="info-card">
                <span className="info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E05A47" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                  </svg>
                  Sensação
                </span>
                <b>{Math.round(clima.current.apparent_temperature)}°C</b>
              </div>

              <div className="info-card">
                <span className="info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#3B82F6">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                  Umidade
                </span>
                <b>{clima.current.relative_humidity_2m}%</b>
              </div>

              <div className="info-card">
                <span className="info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
                  </svg>
                  Vento
                </span>
                <b>{Math.round(clima.current.wind_speed_10m)} km/h</b>
              </div>

              <div className="info-card">
                <span className="info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#3B82F6">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                  Precipitação
                </span>
                <b>{clima.current.precipitation} mm</b>
              </div>

              <div className="info-card">
                <span className="info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/>
                  </svg>
                  Índice UV
                </span>
                <b>{clima.daily.uv_index_max[0]}</b>
              </div>

              <div className="info-card">
                <span className="info-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 18a5 5 0 0 0-10 0"/>
                    <line x1="12" y1="9" x2="12" y2="2"/>
                    <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
                    <line x1="1" y1="18" x2="3" y2="18"/>
                    <line x1="21" y1="18" x2="23" y2="18"/>
                    <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
                    <line x1="23" y1="22" x2="1" y2="22"/>
                  </svg>
                  Nascer / Pôr do sol
                </span>
                <b>{clima.daily.sunrise[0].slice(11)} / {clima.daily.sunset[0].slice(11)}</b>
              </div>
            </div>
          </div>
        </section>
      )}

      {clima && !carregando && (
        <section className="previsao-container">
          <h3>Previsão para os próximos 10 dias</h3>
          <div className="dias">
            {clima.daily.time.map((data, i) => {
              const infoDia = formatarDia(data, i)
              const infoClima = pegarInfo(clima.daily.weather_code[i])
              return (
                <div key={i} className="dia">
                  <b>{infoDia.nome}</b>
                  <span className="dia-data">{infoDia.data}</span>
                  <div className="dia-icone">
                    <IconeClima tipo={infoClima.tipo} tamanho={44} />
                  </div>
                  <p className="dia-desc">{infoClima.descricao}</p>
                  <p className="dia-temp">
                    <b>{Math.round(clima.daily.temperature_2m_max[i])}°</b>{' '}
                    <span>{Math.round(clima.daily.temperature_2m_min[i])}°</span>
                  </p>
                  <p className="dia-chuva">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/>
                    </svg>
                    {clima.daily.precipitation_probability_max[i]}%
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <footer className="rodape">
        
         
      </footer>
    </div>
  )
}

export default App