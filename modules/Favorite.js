import { GithubUser } from "./GithubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);

      if (userExists) {
        throw new Error("Usuário já cadastrado");
      }

      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado!");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");

    this.update();
    this.onAdd();
  }

  onAdd() {
    const addButton = this.root.querySelector(".search button");
    addButton.addEventListener("click", () => {
      const { value } = this.root.querySelector(".search input");

      if (value === "") {
        alert("Digite um usuário válido!");
        return;
      }

      this.add(value);
    });
  }

  update() {
    console.log(this.entries);

    if (this.entries.length === 0) {
      this.tbody.innerHTML = `
        <td class='emptyTable' >
        <div>
        <img src="./assets/Estrela.svg" alt="Nenhum usuário adicionado" />
        <span>Nenhum favorito ainda</span>
        </div>
        </td>

      `;
      return;
    }

    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Imagem de ${user.name}`;
      row.querySelector(".user p:first-child").textContent = user.name;
      row.querySelector(".user p:last-child").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").addEventListener("click", () => {
        const isOk = confirm(`Tem certeza que deseja remover ${user.name}?`);
        if (isOk) {
          this.delete(user);
        }
      });

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td class="user">
            <img
              src="https://avatars.githubusercontent.com/u/2254731?v=4"
              alt="avatar do usuário"
            />
            <div>
              <p>Fulano Velho</p>
              <p>/FVelho</p>
            </div>
          </td>
          <td class="repositories">37</td>
          <td class="followers">666</td>
          <td>
            <button class="remove">Remover</button>
          </td>
        `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
