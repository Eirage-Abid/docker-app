# Docker demo: custom image + public image

A minimal Node/Express + MongoDB app built to demonstrate the exact workflow
from the diagram: your own code becomes a **custom Docker image** (built by
Jenkins and pushed to a registry), while MongoDB stays a **public image**
pulled straight from Docker Hub.

## 1. Run it locally first

```bash
docker compose up --build
```

- `app` — built from your local `Dockerfile` (custom image)
- `mongo` — pulled from Docker Hub (public image, official `mongo:7`)

Test it:

```bash
curl http://localhost:3000
curl -X POST http://localhost:3000/notes -H "Content-Type: application/json" -d '{"text":"hello docker"}'
curl http://localhost:3000/notes
```

Stop everything:

```bash
docker compose down        # stops containers, keeps the mongo-data volume
docker compose down -v     # also wipes the database volume
```

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit: docker demo app"
git branch -M main
git remote add origin https://github.com/<your-username>/docker-demo-app.git
git push -u origin main
```

## 3. Wire up Jenkins

You need a Jenkins instance that can run Docker commands (either Jenkins
installed with Docker access, or a Jenkins agent that has the Docker CLI).
Easiest way to get one running locally for this demo:

```bash
docker run -d --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

Then:
1. Open `http://localhost:8080`, unlock Jenkins, install suggested plugins.
2. Install the **Docker Pipeline** plugin if not already present.
3. Add your Docker Hub (or other registry) credentials under
   **Manage Jenkins → Credentials**, with the ID `dockerhub-credentials`
   (matches the `Jenkinsfile`).
4. Create a new **Pipeline** job, point it at your GitHub repo, and set it
   to use the `Jenkinsfile` in the repo root.
5. Edit `IMAGE_NAME` in the `Jenkinsfile` to your own Docker Hub
   username/repo.

## 4. Trigger a build

Push a commit (e.g. tweak `src/server.js`) and either run the Jenkins job
manually or set up a GitHub webhook so Jenkins builds automatically on push.

Jenkins will then:
1. Check out your latest code
2. `docker build` your custom image from the `Dockerfile`
3. `docker push` it to your registry (Docker Hub, in this example)

## 5. Pull both images on a "dev server"

Anywhere else (another machine, or just a different folder locally), you can
now reproduce the exact setup by pulling both images — one custom, one
public — without needing the source code at all:

```yaml
services:
  app:
    image: yourdockerhubuser/docker-demo-app:latest   # your custom image
    ports: ["3000:3000"]
    environment:
      MONGO_URI: mongodb://mongo:27017/notesdb
    depends_on: [mongo]

  mongo:
    image: mongo:7                                    # public image
    volumes: ["mongo-data:/data/db"]

volumes:
  mongo-data:
```

```bash
docker compose up -d
```

This is the same "Dev Server pulls both images" step from the diagram —
your app comes from your own registry, MongoDB comes straight from
Docker Hub, and neither needs to be rebuilt on this machine.
