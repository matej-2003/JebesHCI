## install

- nared python virtualenv
```shell
virtualenv jebesHCI
```

```shell
git clone https://github.com/matej-2003/JebesHCI.git
```

pridobi lokalni ip
```shell
ip add
```
naredi certifikat
```shell
mkcert -key-file key.pem -cert-file cert.pem <your-ip>
mkcert -key-file key.pem -cert-file cert.pem $(hostname -I | awk '{print $1}')
```

naredi certifikat
```shell
python run.py
```
