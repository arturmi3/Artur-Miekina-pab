var _a;
const studenci = [];
const kasia = { imie: 'Kasia', wiek: 20 };
const tomek = { imie: 'Tomek', wiek: 19 };
studenci.push(kasia, tomek);
// łączenie tablic
const a1 = [1, 2, 4];
const a2 = [2, 3, 4];
const b = [...a1, ...a2];
//kopiowanie przez wartość
const c = 10;
const d = c;
// iteracja
b.forEach(value => {
    console.log(value);
});
for (const item of b) {
    console.log(item);
}
//..dla obiektów kopiujemy przez referencję!
// find - odszukaj element w tablicy
const kasiaCopy = studenci.find(searchStudent);
// znajdź indeks elementu w tablicy
const kasiaIdx = studenci.findIndex(searchStudent);
// predykat - funkcja przeszukująca tablicę
function searchStudent(student) {
    return student.imie === 'Kasia';
}
// wycinanie z tablicy - tutaj wytnij 2 elementy poczynając od indeksu 1
b.splice(1, 2);
// filtrowanie tablicy
const newStudenci = studenci.filter(st => st.imie !== 'Kasia');
// mapowanie - zmiana zawartości elementów tablicy
const result = studenci.map(st => {
    st.wiek++;
    return st;
});
// przeglądanie tablicy
// studenci.some(), studeci.every()
// a tego nie praktykujemy;)
studenci.length = 0;
// iteracja po tablicy
studenci.forEach(st => {
    // do sth
});
// lub 
for (const st of studenci) {
    // do sth
    console.log(st);
}
// iteracja po obiektach
for (const stKey in studenci) {
    const im = studenci[stKey];
    console.log(im);
}
// zapobieganie wyjatkom jeśli foo lub bar nie istnieją
const foo = {};
const x = (_a = foo === null || foo === void 0 ? void 0 : foo.bar) === null || _a === void 0 ? void 0 : _a.baz();
// nullish coalescing
const y = x !== null && x !== void 0 ? x : 5;
class Student {
    constructor(imie, wiek) {
        this.imie = imie;
        this.wiek = wiek;
    }
    get rokStudiow() {
        return this._rokStudiow;
    }
    set rokStudiow(val) {
        this._rokStudiow = val;
    }
    getRokStudiow() {
        return this._rokStudiow;
    }
}
class Note {
}
let note1 = { title: 'abbbb', content: 'content c', createDate: Date.now().toString(), };
note1.title = "abecadlo";
console.log(note1);
console.log(note1.title);
