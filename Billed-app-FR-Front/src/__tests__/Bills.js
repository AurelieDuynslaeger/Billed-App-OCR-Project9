/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

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

    //test clik on icon eye line 14 to display modal
    test("Then modal should open and display the bill when i click on eye icon", () => {
      //configuration du localStorage pour simuler l'utilisateur connect
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      //création d'un élément root pour simuler le rendu de l'interface
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      //exécution du routeur pour simuler la navigation sur la page des factures
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      //rendu de l'interface des factures
      document.body.innerHTML = BillsUI({ data: bills })

      //ajout de la modale en reprenant les attributs et les class css
      const modale = document.createElement('div')
      modale.setAttribute('id', 'modaleFile')
      modale.setAttribute('data-testid', 'modaleFile')
      modale.classList.add("modal", "fade")
      //reconstitution de la structure de la modale
      modale.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Justificatif</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body"></div>
          </div>
        </div>
      `;
      document.body.append(modale)

      //mock de la méthode modal de JQuery
      //doc Jest
      $.fn.modal = jest.fn()

      //instanciation de la class Bills
      const billsContainer = new Bills({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES_PATH[pathname],
        store: null,
        localStorage: window.localStorage
      })

      //récup des icones
      const icon = screen.getAllByTestId('icon-eye')[0]

      //verifier ajout attribut data-bill-url (handleClickIconEye effet)
      icon.setAttribute('data-bill-url', 'https://test.com')
      //simulation du clik sur l'icone
      userEvent.click(icon);

      //vérif de la modale qui s'affiche
      //permet de s'assurer qu'une fonction fictive a été appelée avec des arguments spécifiques (ici show)
      expect($.fn.modal).toHaveBeenCalledWith("show")

      //vérif que l'image du fichier de la facture est affichée dans la modale
      const modalBody = document.querySelector("#modaleFile .modal-body");
      expect(modalBody).toBeTruthy();

      //verif que l'image fichier facture est affiché dans la modale
      const img = modalBody.querySelector('img');
      expect(img).toBeTruthy()
      expect(img.src).toBe('https://test.com/')
    })
    test("Then user should be redirected to new bill form when new bill button is clicked", async () => {
      //configuration du localStorage pour simuler l'utilisateur connecté
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      //création d'un élément root pour simuler le rendu de l'interface
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Exécution du routeur pour simuler la navigation sur la page des factures
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      //attente de l'affichage de l'interface BillsUI
      document.body.innerHTML = BillsUI({ data: bills });

      //instanciation de la classe Bills
      const billsContainer = new Bills({
        document,
        onNavigate: (pathname) => {
          document.body.innerHTML = ROUTES_PATH[pathname];
        },
        store: null,
        localStorage: window.localStorage,
      });

      //ajout du bouton New Bill au DOM
      //attente que le bouton "Nouvelle Facture" soit présent dans le DOM

      const buttonNewBill = screen.getByTestId('btn-new-bill');
      expect(buttonNewBill).toBeTruthy();

      buttonNewBill.addEventListener("click", () => {
        billsContainer.handleClickNewBill();
      });

      userEvent.click(buttonNewBill);

      //attente que l'utilisateur soit redirigé vers la nouvelle page de facturation (NewBillUI)
      await waitFor(() => {
        expect(window.location.pathname).toBe(ROUTES_PATH.NewBill);
      });

      // Vérification que NewBillUI est correctement rendue dans le DOM
      expect(document.body.innerHTML).toContain('form-new-bill');

      // Vérification finale avec getByTestId
      expect(screen.getByTestId('form-new-bill')).toBeTruthy();
    });
  })
})
