import os
from datetime import datetime

# 1. Determina automaticamente la cartella ESATTA in cui si trova questo script
CARTELLA_BASE = os.path.dirname(os.path.abspath(__file__))

# Configurazione: cartelle da ignorare
CARTELLE_IGNORATE = ['node_modules', '.git', 'dist', '.vscode', '.firebase', 'public', 'assets']
# Estensioni dei file che ci interessano
ESTENSIONI_VALIDE = ['.vue', '.js']

# 2. Generazione del timestamp corrente (Formato: ANNO-MESE-GIORNO_ORE-MINUTI-SECONDI)
# Esempio risultato: 20260608_223200
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

# 3. Configurazione del percorso direttamente sul disco C:\ con il timestamp nel nome
# Utilizza os.path.expanduser("~") per trovare automaticamente la tua cartella utente (C:\Users\visua)
FILE_OUTPUT = os.path.join(os.path.expanduser("~"), "Desktop", f"progetto_completo_antigravity_{timestamp}.txt")

def genera_mappatura():
    try:
        with open(FILE_OUTPUT, 'w', encoding='utf-8') as outfile:
            # Aggiunta del timestamp anche nell'intestazione del file per comodità
            outfile.write(f"MAPPATURA PROGETTO GESTIONALE ALLENAMENTO - Creato il {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
            
            # 4. Scansione della directory di base
            for root, dirs, files in os.walk(CARTELLA_BASE):
                # Escludiamo le cartelle pesanti
                dirs[:] = [d for d in dirs if d not in CARTELLE_IGNORATE]
                
                for file in files:
                    if any(file.endswith(ext) for ext in ESTENSIONI_VALIDE):
                        percorso_completo = os.path.join(root, file)
                        
                        # Intestazione chiara
                        outfile.write(f"\n{'='*60}\n")
                        outfile.write(f"📂 FILE: {percorso_completo}\n")
                        outfile.write(f"{'='*60}\n\n")
                        
                        # Lettura e scrittura
                        try:
                            with open(percorso_completo, 'r', encoding='utf-8') as f_in:
                                outfile.write(f_in.read() + "\n")
                        except Exception as e:
                            outfile.write(f"[Errore nella lettura del file: {e}]\n")

        print(f"\n✅ Fatto! Mappatura salvata con successo in:\n{FILE_OUTPUT}\n")
        
    except PermissionError:
        print(f"\n❌ Errore di permessi: Impossibile scrivere direttamente nella root C:\\.")
        print("💡 Suggerimento: Avvia il tuo editor di codice (es. VS Code) o il Prompt dei comandi come Amministratore, oppure cambia il percorso su una cartella utente (es. C:\\Utenti\\... o C:\\Progetti).")
    except Exception as e:
        print(f"\n❌ Errore imprevisto durante la creazione del file: {e}")

if __name__ == "__main__":
    genera_mappatura()