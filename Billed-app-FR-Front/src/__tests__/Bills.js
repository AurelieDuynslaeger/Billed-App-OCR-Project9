/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

      //conversion de la date formatée en ISO avant de les comparer pour les trier
      const formatedToIso = (date) => {
        //sépare la date formatée en jour, mois et année
        const [day, monthString, year] = date.split(' ');
        //obtient l'index du mois à partir du tableau des mois abrégés français
        const month = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'].indexOf(monthString) + 1;
        //retourne la date au format ISO (YYYY-MM-DD)
        return `20${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }

      //convertit toutes les dates formatées en ISO
      const datesISO = dates.map(date => formatedToIso(date));
      //trie les dates ISO de la plus récente à la plus ancienne
      const datesSortedISO = [...datesISO].sort((a, b) => new Date(b) - new Date(a));
      //vérifie que les dates affichées (converties en ISO) sont triées de manière correcte
      expect(datesISO).toEqual(datesSortedISO);

      // const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      // const datesSorted = [...dates].sort(antiChrono)
      // expect(dates).toEqual(datesSorted)
    })
  })
})
