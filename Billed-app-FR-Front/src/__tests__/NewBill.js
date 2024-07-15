/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js";


//import du mockStore avec les mockedBills
import mockStore from "../__mocks__/store.js";

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
      // Utiliser le mock du magasin pour retourner les factures
      const storeMock = {
        bills: jest.fn(() => ({
          create: jest.fn().mockResolvedValueOnce({ fileUrl: 'mockedUrl', key: 'mockedKey' })
        }))
      };
      //générer le html de newbill ui 
      document.body.innerHTML = NewBillUI();
      //mock de la fonction onNavigate (simuler le comportement de navigation)
      const onNavigate = jest.fn();

      //instanciation de la classe Bills
      const bill = new NewBill({
        document,
        onNavigate,
        store: storeMock,
        localStorage: window.localStorage,
      });

      // Capturer les messages d'erreur de la console
      const consoleErrorSpy = jest.spyOn(console, 'error');
      consoleErrorSpy.mockImplementation(() => { });

      //création d'une fonction mockée qui est basé sur la méthode handleChangeFile, permet de vori si la méthode est appelée et controler son comportement
      const handleChangeFile = jest.fn(bill.handleChangeFile)

      //selection de l'élément d'entrée d'un fichier
      const fileInput = screen.getByTestId("file")

      //on écoute le changelent surc cet input
      //si un changement est détecté, la fonction handleChangeFile est appelée
      fileInput.addEventListener("change", handleChangeFile)

      //nvl objet File (nom ="foo", fichier= "foo.txt" type du fichier)
      const file = new File(['foo'], 'foo.txt', { type: 'text/plain' })

      //simulation de l'action de upload par l'user
      userEvent.upload(fileInput, file)

      //verification que la fonction ait bien été appélé après le dl du fichier
      expect(handleChangeFile).toHaveBeenCalled();

      //simuler la soumission
      fireEvent.submit(screen.getByTestId("form-new-bill"));


      //s'assurer que la méthode create est appelée avec le FormData correct
      const formData = new FormData();
      const email = JSON.parse(localStorage.getItem("user")).email;
      formData.append('file', file);
      formData.append('email', email);

      expect(storeMock.bills().create).toHaveBeenCalledWith({
        data: formData,
        headers: {
          noContentType: true
        }
      });

      //s'assurers que billId, fileUrl et fileName sont correctement mis à jour
      expect(bill.billId).toBe('mockedKey');
      expect(bill.fileUrl).toBe('mockedUrl');
      expect(bill.fileName).toBe('foo.jpg');
      //vérification que la valeur de l'élément d'entrée de fichier (fileInput) est vide après avoir tenté de télécharger le fichier, ce qui indique que le fichier avec l'extension incorrecte n'a pas été accepté.
      expect(fileInput.value).toBe("")
      // Vérifier que console.error a été appelé avec le message d'erreur attendu
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain("Fichier invalide");

      // Restaurer la fonction d'origine de console.error
      consoleErrorSpy.mockRestore();

    })

    test("When I submit the form with valid datas, then it should call handleSubmit and navigate back to bills page", () => {
      //générer le html de newbill ui 
      document.body.innerHTML = NewBillUI();
      //mock de la fonction onNavigate (simuler le comportement de navigation)
      const onNavigate = jest.fn();

      // utiliser le mock du magasin pour retourner les factures
      const storeMock = {
        bills: mockStore.bills,
      }

      //instanciation de la classe Bills
      const bill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const handleSubmit = jest.fn(bill.handleSubmit)
      const form = screen.getByTestId("form-new-bill")


      bill.fileUrl = 'C:Users/Username/Documents/file.jpg'
      bill.fileName = 'file.jpg'

      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: 'Transports' } })
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: 'Vol Paris Londres' } })
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: '2021-12-01' } })
      fireEvent.change(screen.getByTestId("amount"), { target: { value: '348' } })
      fireEvent.change(screen.getByTestId("vat"), { target: { value: '70' } })
      fireEvent.change(screen.getByTestId("pct"), { target: { value: '20' } })
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: 'Voyage d\'affaires' } })

      //écouteur d'évént de soumission au formulaire
      form.addEventListener("submit", handleSubmit)
      //simuler la soumission du formulaire
      fireEvent.submit(form)
      //vérifier que handleSubmit a été appelé
      expect(handleSubmit).toHaveBeenCalled()
      //vérifier que la navigation a eu lieu
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
    })
  })
})
