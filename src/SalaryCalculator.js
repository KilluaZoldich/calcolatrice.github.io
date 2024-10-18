import React, { useState, useEffect } from 'react';
import { Settings, Calculator } from 'lucide-react';

const SalaryCalculator = () => {
  const giorniSettimana = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

  const [parametri, setParametri] = useState({
    stipendioOrario: 0,
    indennitaGuida: 0,
    extra: 0,
    ff: 0,
    ffCena: 0,
    reperibilitaFeriale: 0,
    reperibilitaSabato: 0,
    reperibilitaFestivo: 0,
    straordinario: 0,
  });

  const [giorni, setGiorni] = useState(Array(28).fill().map((_, index) => ({
    giorno: index + 1,
    presenza: false,
    guida: false,
    extraFF: 'nulla',
    reperibilita: false,
    ffCena: false,
    straordinarioOre: 0,
    straordinarioMinuti: 0,
  })));

  const [mostraParametri, setMostraParametri] = useState(false);
  const [totale, setTotale] = useState(0);
  const [settimanaSelelezionata, setSettimanaSelelezionata] = useState(1);

  useEffect(() => {
    const datiSalvati = JSON.parse(localStorage.getItem('datiStipendio'));
    if (datiSalvati) {
      setParametri(datiSalvati.parametri);
      setGiorni(datiSalvati.giorni);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('datiStipendio', JSON.stringify({ parametri, giorni }));
  }, [parametri, giorni]);

  const handleParametriChange = (e) => {
    const { name, value } = e.target;
    setParametri(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleGiornoChange = (index, field, value) => {
    setGiorni(prev => prev.map((giorno, i) => 
      i === index ? { ...giorno, [field]: value } : giorno
    ));
  };

  const calcolaStipendio = () => {
    const totale = giorni.reduce((acc, giorno) => {
      let giornoTotale = 0;
      if (giorno.presenza) giornoTotale += parametri.stipendioOrario * 7.6;
      if (giorno.guida) giornoTotale += parametri.indennitaGuida;
      if (giorno.extraFF === 'extra') giornoTotale += parametri.extra;
      if (giorno.extraFF === 'ff') giornoTotale += parametri.ff;
      if (giorno.ffCena) giornoTotale += parametri.ffCena;
      if (giorno.reperibilita) {
        const giornoDellasettimana = (giorno.giorno - 1) % 7;
        if (giornoDellasettimana === 6) giornoTotale += parametri.reperibilitaFestivo;
        else if (giornoDellasettimana === 5) giornoTotale += parametri.reperibilitaSabato;
        else giornoTotale += parametri.reperibilitaFeriale;
      }
      const straordinarioTotale = giorno.straordinarioOre + (giorno.straordinarioMinuti / 60);
      giornoTotale += straordinarioTotale * parametri.straordinario;
      return acc + giornoTotale;
    }, 0);

    setTotale(totale);
  };

  const renderGiornoCard = (giorno, index) => {
    const giornoSettimana = giorniSettimana[index % 7];
    return (
      <div key={index} className="day-card">
        <div className="day-header">
          <span className="day-name">{giornoSettimana}</span>
          <span>{giorno.giorno}</span>
        </div>
        <div className="day-options">
          <div className="day-option">
            <input
              type="checkbox"
              checked={giorno.presenza}
              onChange={(e) => handleGiornoChange(index, 'presenza', e.target.checked)}
            />
            <label>Presente</label>
          </div>
          <div className="day-option">
            <input
              type="checkbox"
              checked={giorno.guida}
              onChange={(e) => handleGiornoChange(index, 'guida', e.target.checked)}
            />
            <label>Guida</label>
          </div>
          <div className="day-option">
            <select 
              value={giorno.extraFF} 
              onChange={(e) => handleGiornoChange(index, 'extraFF', e.target.value)}
            >
              <option value="nulla">-</option>
              <option value="extra">Extra</option>
              <option value="ff">FF</option>
            </select>
          </div>
          <div className="day-option">
            <input
              type="checkbox"
              checked={giorno.reperibilita}
              onChange={(e) => handleGiornoChange(index, 'reperibilita', e.target.checked)}
            />
            <label>Reperibilità</label>
          </div>
          <div className="day-option">
            <input
              type="checkbox"
              checked={giorno.ffCena}
              onChange={(e) => handleGiornoChange(index, 'ffCena', e.target.checked)}
            />
            <label>FF Cena</label>
          </div>
        </div>
        <div className="overtime-section">
          <span>Straordinario:</span>
          <input 
            type="number" 
            className="overtime-input"
            value={giorno.straordinarioOre} 
            onChange={(e) => handleGiornoChange(index, 'straordinarioOre', parseInt(e.target.value) || 0)} 
          />
          <span>h</span>
          <input 
            type="number" 
            className="overtime-input"
            value={giorno.straordinarioMinuti} 
            onChange={(e) => handleGiornoChange(index, 'straordinarioMinuti', parseInt(e.target.value) || 0)} 
            min="0" 
            max="59"
          />
          <span>m</span>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <h1>Calcolatrice di Stipendio</h1>
      <button 
        className="settings-button"
        onClick={() => setMostraParametri(!mostraParametri)}
      >
        <Settings size={24} />
      </button>

      {mostraParametri && (
        <div className="settings-panel">
          <div className="settings-grid">
            {Object.entries(parametri).map(([key, value]) => (
              <div key={key}>
                <label>{key}</label>
                <input
                  type="number"
                  name={key}
                  value={value}
                  onChange={handleParametriChange}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="calculator-grid">
        <div>
          <div className="week-selector">
            {[1, 2, 3, 4].map((week) => (
              <button
                key={week}
                onClick={() => setSettimanaSelelezionata(week)}
                className={`week-button ${settimanaSelelezionata === week ? 'active' : ''}`}
              >
                Settimana {week}
              </button>
            ))}
          </div>
          <button onClick={calcolaStipendio} className="calculate-button">
            <Calculator size={20} />
            Calcola Stipendio
          </button>
          {totale > 0 && (
            <div className="total">
              Totale: €{totale.toFixed(2)}
            </div>
          )}
        </div>
        
        <div className="days-panel">
          {giorni.slice((settimanaSelelezionata - 1) * 7, settimanaSelelezionata * 7).map((giorno, index) => 
            renderGiornoCard(giorno, (settimanaSelelezionata - 1) * 7 + index)
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;
