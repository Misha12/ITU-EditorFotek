# ITU-EditorFotek

# Instalace (Windows)
1) Node.JS v poslední verzi (https://nodejs.org/en/). **Vč. NPM (bývá součástí instalace)**
2) Angular CLI (https://cli.angular.io/) příkazem `npm install -g @angular/cli`
3) Stáhnout si tento repozitář přes `git clone https://github.com/Misha12/ITU-EditorFotek.git`
   - Doporučení: Nedávejte si to na cloud úložiště. Cloud moc nezvládá velké množství malých souborů. 
4) Nastavit Firewall, aby propouštěla port 4200
    a) Spusťte CMD s Admin právy.
    b) Zavolejte příkaz `netsh advfirewall firewall add rule name="Angular Development 4200" dir=in action=allow protocol=TCP localport=4200`
5) Spusťte v konzoli příkaz `npm install`.
6) Spustit v konzoli příkaz `npm start`.

Aplikace se spustí. Chvíli se bude překládat. Jakmile v konzoli vypíše `Compiled successfully`, tak je webový server spuštěný a čeká na připojení na portu 4200. Aplikaci lze otevřít i v telefonu přes volání ip:4200.

# Hodnocení
44/55

# Členové týmu

- [Michal Halabica](https://github.com/Misha12)
- [Jan Láncoš](https://github.com/yellthedivine)
- Klára Formánková
