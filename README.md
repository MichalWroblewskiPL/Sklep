PcBase – Sklep internetowy podzespołów komputerowych
Opis projektu

PcBase to aplikacja webowa typu e-commerce, stworzona w ramach pracy inżynierskiej.
Projekt umożliwia sprzedaż komponentów komputerowych oraz zarządzanie zamówieniami z podziałem na role użytkowników.

Aplikacja została zrealizowana w technologii React + TypeScript z wykorzystaniem Firebase jako backendu (Authentication, Firestore).

Funkcjonalności aplikacji:
  1. Użytkownik

- rejestracja i logowanie

- edycja profilu użytkownika

- zarządzanie danymi adresowymi

- przeglądanie produktów i kategorii

- koszyk zapisany w bazie danych (Firestore)

- składanie zamówień:

    płatność: gotówka / karta (przy odbiorze)

    dostawa: odbiór osobisty / kurier

    podgląd historii zamówień

    szczegóły zamówienia i status realizacji

- usunięcie konta

  2. Pracownik

- dostęp do panelu administracyjnego

- lista wszystkich zamówień:

    paginacja

    wyszukiwanie po ID zamówienia lub ID użytkownika

    szczegóły zamówienia

- zmiana statusu zamówienia:

    Oczekujące

    Wysłane

    Dostarczone

    Anulowane

- lista produktów:

    paginacja

    wyszukiwanie po nazwie

    edycja produktów

  3. Dane testowe (loginy)

- Testowy użytkownik
  Login: user@test.com
  Hasło: Test1@User

  Można testować:

  - składanie zamówień

  - koszyk

  - profil użytkownika

  - historię zamówień

  - szczegóły zamówień

- Testowy pracownik
  Login: pracownik@test.com
  Hasło: Test1@Pracownik


  Można testować:

  - panel pracownika

  - zarządzanie zamówieniami

  - zmianę statusów

  - wyszukiwanie i paginację

  - zarządzanie produktami

4. Technologie wykorzystane w projekcie
Frontend:

- React 18

- TypeScript

- React Router

- Tailwind CSS

- Context API

Backend:

- Firebase Authentication

- Firebase Firestore

- Firebase Storage

Testy:

- Jest

- React Testing Library

- ts-jest

- jsdom

5. Wymagania systemowe
- System operacyjny

  Windows 10 / Windows 11

- Wymagane narzędzia

  Node.js ≥ 18.x
  https://nodejs.org

  npm (instalowany razem z Node.js)

  Git
  https://git-scm.com

6.Instrukcja instalacji projektu (krok po kroku)

- Pobranie projektu z repozytorium Git
  git clone <ADRES_REPOZYTORIUM>
  lub pobrać projekt w ZIP i wypakować
  
  cd Sklep (uruchomić sklep w konsoli)

- Instalacja zależności
npm install

- Uruchomienie aplikacji (tryb developerski)
npm run dev


Po uruchomieniu aplikacja będzie dostępna pod adresem:

http://localhost:5173

7. Uruchamianie testów
Instalacja środowiska testowego (jeśli jeszcze nie jest)
npm install

Uruchomienie testów
npm test

Oczekiwany wynik:
Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total


Testy obejmują:

renderowanie formularza logowania

walidację danych wejściowych (adres e-mail)

8. Bezpieczeństwo

aplikacja nie korzysta z SQL → brak podatności na SQL Injection

uwierzytelnianie realizowane przez Firebase Authentication

kontrola dostępu oparta o role użytkowników

reguły bezpieczeństwa Firestore ograniczają dostęp do danych

walidacja danych po stronie klienta

9. Testowanie

W projekcie zastosowano testy jednostkowe interfejsu użytkownika z wykorzystaniem Jest oraz React Testing Library.
Testy umożliwiły wykrycie błędów dostępności (a11y) oraz niespójności walidacji formularzy, które zostały poprawione w trakcie realizacji projektu.


10. Autorzy

Michał Wróblewski
Mateusz Żełudziewicz
Klaudia Włoczyk
