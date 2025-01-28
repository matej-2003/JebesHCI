## web deployment available
https://matej-2003.github.io/HCIApp/

## install for local testing

- nared python virtualenv
```shell
virtualenv venv
```

```shell
git clone https://github.com/matej-2003/JebesHCI.git
```

pridobi lokalni ip
```shell
ip add
```

meke certificate and install to you local browser for the PWA to be installable

```shell
mkcert -key-file key.pem -cert-file cert.pem <your-ip>
mkcert -key-file key.pem -cert-file cert.pem $(hostname -I | awk '{print $1}')
```

run the flask 
```shell
python run.py
```
