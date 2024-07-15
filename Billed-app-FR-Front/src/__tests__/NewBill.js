/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
// import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
// import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js";

//import du mockStore avec les mockedBills
// import mockStore from "../__mocks__/store.js";

//mock du store
// jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    //avant chaque test, initialisation
    beforeEach(() => {
      //configuration du localStorage pour simuler l'utilisateur connecté
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      //création d'un élément root pour simuler le rendu de l'interface
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Exécution du routeur pour simuler la navigation sur la page NewBill
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    })

    test("Then the new bill form is displayed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      expect(screen.getByTestId("expense-type")).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()
      expect(screen.getByTestId("vat")).toBeTruthy()
      expect(screen.getByTestId("pct")).toBeTruthy()
      expect(screen.getByTestId("commentary")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
    })

    test("Then I upload a file with an incorrect extension it should display an error message", () => {
      //nvl instance de NewBill en lui passant les objets necessaires pour qu'elle fonctionne
      //document html
      //onNavigate = navigation entre les pages (fonction simulée)
      //mockStore : store simulé
      // const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: localStorageMock })

      //création d'une fonction mockée qui est basé sur la méthode handleChangeFile, permet de vori si la méthode est appelée et controler son comportement
      // const handleChangeFile = jest.fn(newBill.handleChangeFile)

      //selection de l'élément d'entrée d'un fichier
      // const fileInput = screen.getByTestId("file")

      //on écoute le changelent surc cet input
      //si un changement est détecté, la fonction handleChangeFile est appelée
      // fileInput.addEventListener("change", handleChangeFile)

      //nvl objet File (nom ="foo", fichier= "foo.txt" type du fichier)
      // const file = new File(['foo'], 'foo.txt', { type: 'text/plain' })

      //simulation de l'action de upload par l'user
      // userEvent.upload(fileInput, file)

      //verification que la fonction ait bien été appélé après le dl du fichier
      // expect(handleChangeFile).toHaveBeenCalled()
      //vérification que la valeur de l'élément d'entrée de fichier (fileInput) est vide après avoir tenté de télécharger le fichier, ce qui indique que le fichier avec l'extension incorrecte n'a pas été accepté.
      // expect(fileInput.value).toBe("")
    })

    test("When I submit the form with valid data, then it should call handleSubmit", () => {
      // const newBill = new NewBill({
      //   document, onNavigate: (pathname) => {
      //     document.body.innerHTML = ROUTES_PATH[pathname];
      //   }, store: mockStore, localStorage: localStorageMock
      // })
      // const handleSubmit = jest.fn(newBill.handleSubmit)
      // const form = screen.getByTestId("form-new-bill")

      // form.addEventListener("submit", handleSubmit)

      //simulation d'event user tape du texte sur l'input qu'on précise en premier argument
      // userEvent.type(screen.getByTestId("expense-type"), "Transports")
      // userEvent.type(screen.getByTestId("expense-name"), "Vol Paris Londres")
      // userEvent.type(screen.getByTestId("datepicker"), "2022-05-01")
      // userEvent.type(screen.getByTestId("amount"), "348")
      // userEvent.type(screen.getByTestId("vat"), "70")
      // userEvent.type(screen.getByTestId("pct"), "20")
      // userEvent.type(screen.getByTestId("commentary"), "Voyage d'affaires")

      //soumission du formulaire en utilisant userEvent
      // userEvent.click(screen.getByTestId("form-new-bill-submit"));

      //vérification de handleSubmit est appélée
      // expect(handleSubmit).toHaveBeenCalled()
    })
  })
})
