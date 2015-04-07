
import time, urllib.request

text = """Lorem ipsum more to come... or mortekam""".split('\n')

data = ["""{
  "type" : ["invoice"],
  "customer": {
    "id": "165312",
    "name": "Doe Corp",
    "contact": "Jane Doe",
    "street": "Street",
    "housenumber": "3a",
    "postalcode": "15648",
    "city": "Wondercity"
  },
  "document": {
    "id": "21323",
    "subject": "Aenean leo ligula",
    "date": "1. April 2015",
    "due": "1. Mai 2015",
    "tax": 19,
    "body": [
""",
"""    ],
    "content": [
      {
        "type": "heading",
        "body": "Product developement"
      },
      {
        "type": "entry",
        "body": {
          "position": "1",
          "description": "Super awesome product",
          "quantity": 36,
          "unit": "Std",
          "pricePerUnit": 165
        }
      },
      {
        "type": "entry",
        "body": {
          "position": "1",
          "description": "Super awesome product",
          "quantity": 36,
          "unit": "Std",
          "pricePerUnit": 165
        }
      },
      {
        "type": "subtotal",
        "body": "Subtotal description text:"
      },
      {
        "type": "entry",
        "body": {
          "position": "1",
          "description": "Super awesome product",
          "quantity": 36,
          "unit": "Std",
          "pricePerUnit": 165,
          "discount": {
            "type": "fixed",
            "amount": 40
          }
        }
      },
      {
        "type": "subtotal",
        "body": "Subtotal description text:"
      }
    ],
    "total" : {
      "shipping" : 0.0,
      "packing" : 0.0
    }
  }
}"""]

def prepareFile(i):
  words = 0
  with open('./../exampledata.json', 'w', encoding='utf-8') as f:
    f.write(data[0])
    for x in range(i):
      st = """{ "text": " """
      st += text[x % len(text)]
      words += len(text[x % len(text)])
      st += """ " } \n"""
      if x != (i- 1):
        st += ","
      f.write(st)
    f.write(data[1])
    f.flush()
  return words

def test(words):
	pre = time.time()
	obj = urllib.request.urlopen("http://127.0.0.1:8080/document")
	post = time.time()

	if obj:
		obj.close()

	print('{0} words take {1:<5.3} seconds to compile'.format(words, post - pre))

def testAll():
	for i in range(0, len(text) * 4):
		test(prepareFile(i))

def stresstest():
  w = prepareFile(7)
  for i in range(50):
    test(w)

if __name__ == '__main__':
	stresstest()
